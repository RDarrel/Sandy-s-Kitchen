import { fullName } from "@/services/utilities";

const dateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
});

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function localDate(date) {
  if (!date) return null;
  const parts = Object.fromEntries(
    dateParts.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function serviceSchedule(booking, key) {
  const details = booking[key];
  if (!details) return null;
  const start = validDate(details.schedule?.startAt);
  const end = validDate(details.schedule?.endAt);
  return {
    service: key === "catering" ? "Catering" : "Venue",
    date: localDate(start),
    endDate: localDate(end),
    time: start
      ? `${timeLabel.format(start)}${end ? ` – ${timeLabel.format(end)}` : ""}`
      : "Not scheduled",
    guests: details.pax ?? "—",
  };
}

// The input is a populated Booking API record, including its attached payments.
// Keep the original record for future action handlers and detail components.
export function toBookingRow(booking) {
  const { customer } = booking;

  const payments = Array.isArray(booking.payments) ? booking.payments : [];
  const sumPayments = (status) =>
    payments
      .filter((payment) => payment.status === status)
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const schedules = (
    booking.bookingType === "both"
      ? ["catering", "venue"]
      : [booking.bookingType]
  )
    .map((key) => serviceSchedule(booking, key))
    .filter(Boolean);
  const primary =
    schedules.find((schedule) => schedule.service === "Venue") || schedules[0];

  const sortDate =
    validDate(
      (booking.bookingType === "catering" ? booking.catering : booking.venue)
        ?.schedule?.startAt,
    ) || validDate(booking.date);
  const status = String(booking.status || "pending");

  return {
    record: booking,
    _id: booking._id,
    id: booking.reference || booking._id,
    customer: fullName(customer?.fullName),
    email: booking.customer?.email || "—",
    event: booking.eventType || "—",
    service:
      { catering: "Catering", venue: "Venue", both: "Catering + Venue" }[
        booking.bookingType
      ] || "—",
    location:
      booking.venue?.item?.name ||
      booking.catering?.venue?.location ||
      booking.catering?.venue?.address ||
      "—",
    status: status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),

    date: primary?.date || localDate(validDate(booking.date)),
    time: primary?.time || "Not scheduled",
    sortAt: sortDate?.getTime() ?? 0,
    guests: primary?.guests ?? "—",
    ...(booking.bookingType === "both" ? { serviceSchedules: schedules } : {}),
    amount: Number(booking.pricing?.total || 0),
    paid: sumPayments("verified"),
    pendingPayment: sumPayments("pending"),
  };
}
