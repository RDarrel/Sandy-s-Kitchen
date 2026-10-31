const Notfication = require("../../models/events/Notification");
const Booking = require("../../models/events/Booking");
const EmailService = require("../email/Email.service");
const formatDate = (date, withTime = false) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(withTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    timeZone: "Asia/Manila",
  });
};

const formatCurrency = (amount) => {
  return `₱${Number(amount ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
const formattedData = (booking, status) => {
  const { customer } = booking;
  const bookingTypeMap = {
    catering: "Catering",
    venue: "Venue",
    both: "Venue & Catering",
  };
  let baseData = {
    customerName: customer?.fullName?.fname,
    bookingReference: booking?.reference,
    bookingType: bookingTypeMap[booking?.bookingType],
    eventType: booking?.eventType,
    eventDate: formatDate(booking?.date),
    bookingUrl: "https://sandys-kitchenette.vercel.app/",
    facebookUrl: process.env.FACEBOOK_URL,
    instagramUrl: process.env.INSTAGRAM_URL,
    tiktokUrl: process.env.TIKTOK_URL,
  };

  if (status === "approved") {
    baseData = {
      ...baseData,
      totalAmount: formatCurrency(booking?.pricing?.total),
      downPayment: formatCurrency(booking?.terms?.requiredDeposit),
      paymentDeadline: formatDate(booking?.terms?.depositDeadline, true),
    };
  } else if (status === "changes_requested") {
    const history = booking?.statusHistory.findLast(
      ({ status }) => status === "changes_requested",
    );
    baseData = {
      ...baseData,
      reason: history?.reason,
      requestedOn: formatDate(history?.changedAt),
    };
  }

  return baseData;
};
const notifyBooking = async ({ statusTransaction, bookingId }) => {
  if (
    [
      "approved",
      "confirmed",
      "setup",
      "completed",
      "changes_requested",
    ].includes(statusTransaction?.new) &&
    statusTransaction?.new !== statusTransaction?.old
  ) {
    const booking = await Booking.findOne({ _id: bookingId }).populate(
      "customer",
      "fullName",
    );
    const type = `booking_${statusTransaction?.new}`;
    await Notfication.create({
      recipient: booking?.customer,
      type,
      reference: booking?.reference,
    });

    EmailService.send({
      data: formattedData(booking, statusTransaction?.new),
      type,
    });
  }
};

const notifyConfirmedBooking = async ({ bookingId, payment }) => {
  const booking = await Booking.findOne({ _id: bookingId }).populate(
    "customer",
    "fullName",
  );
  const type = `booking_confirmed`;

  await Notfication.create({
    recipient: booking?.customer,
    type,
    reference: booking?.reference,
  });

  const bookingData = {
    ...formattedData(booking),
    verifiedPayment: formatCurrency(payment?.amount),
    totalAmount: formatCurrency(payment?.snapshot?.bookingTotal),
    balance: formatCurrency(
      Math.max(0, payment?.snapshot?.bookingTotal - payment?.amount),
    ),
  };

  EmailService.send({
    data: bookingData,
    type,
  });
};

const notifyPayment = async ({ payment }) => {
  const booking = await Booking.findOne({ _id: payment?.booking }).populate(
    "customer",
    "fullName",
  );

  const { snapshot, status } = payment;
  const { bookingTotal, verifiedSoFar = 0 } = snapshot;
  const type = `payment_${status}`;

  await Notfication.create({
    recipient: booking?.customer,
    type,
    reference: booking?.reference,
  });
  const amount = status === "verified" ? payment?.amount : 0;
  const balance = bookingTotal - Number(amount + verifiedSoFar);
  const bookingData = {
    ...formattedData(booking),
    verifiedPayment: formatCurrency(payment?.amount),
    totalAmount: formatCurrency(bookingTotal),
    balance: formatCurrency(Math.max(0, balance)),
    ...(status !== "verified" && {
      reason: payment?.rejectionReason,
      reviewedOn: formatDate(payment?.reviewedAt, true),
    }),
  };

  EmailService.send({
    data: bookingData,
    type,
  });
};

module.exports = {
  notifyBooking,
  notifyConfirmedBooking,
  notifyPayment,
};
