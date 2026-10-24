const Booking = require("../../../models/events/Booking");
const BookingPolicy = require("../../../models/events/BookingPolicy");
const { attachRecipesToDishes } = require("./helpers/attachRecipesToDishes");
const { calculateTerms } = require("./helpers/calculateTerms");
const update = async ({ bookingToUpdate }) => {
  const { userId, reason } = bookingToUpdate;
  const booking = await Booking.findById(bookingToUpdate?._id);

  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }

  if (bookingToUpdate?.status === "approved") {
    const policy = await BookingPolicy.findOne();

    if (!policy) {
      const error = new Error("Booking policy is not configured.");

      error.statusCode = 400;

      throw error;
    }

    const terms = calculateTerms({
      booking,
      policy,
    });
    booking.terms = terms;
  }

  if (["approved", "update"].includes(bookingToUpdate?.status)) {
    if (bookingToUpdate?.catering?.inclusions?.length > 0) {
      booking.catering = bookingToUpdate.catering;
    }

    if (bookingToUpdate?.venue?.inclusions?.length > 0) {
      booking.venue = bookingToUpdate.venue;
    }
  }

  if (bookingToUpdate?.status !== "update") {
    booking.status = bookingToUpdate?.status;
  }

  if (!["update", "changes_requested"].includes(bookingToUpdate.status)) {
    booking.statusHistory.push({
      status: booking?.status,
      reason,
      changedBy: userId,
      changedAt: new Date(),
    });
  }

  if (bookingToUpdate?.status === "changes_requested") {
    booking.statusHistory = bookingToUpdate.statusHistory;
  }

  await booking.save();

  await booking.populate([
    { path: "customer", select: "fullName" },
    { path: "catering.item", select: "name description" },
    { path: "venue.item", select: "name description address" },
    { path: "catering.inclusions.item" },
    { path: "venue.inclusions.item" },
    { path: "catering.mainDishes.menu" },
    { path: "catering.sideDishes.menu" },
  ]);
  const bookingWithRecipes = await attachRecipesToDishes([booking.toObject()]);
  return bookingWithRecipes[0];
};

const cancel = async ({ role, bookingId, cancellation }) => {
  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: "cancelled",
      cancellation,
    },
    { returnDocument: "after" },
  )
    .populate("cancellation.cancelledBy", "fullName")
    .lean();
  return updated;
};

const accountCorrection = async ({ bookingId, correction }) => {
  const updated = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
    },
    {
      $set: {
        "cancellation.refund.accountCorrection.required": true,
        "cancellation.refund.accountCorrection.reason":
          correction?.reason.trim(),
        "cancellation.refund.accountCorrection.requestedAt": correction?.date,
        "cancellation.refund.accountCorrection.requestedBy": correction.userId,
        "cancellation.refund.accountCorrection.resolvedAt": null,
      },
    },
    { returnDocument: "after" },
  )
    .populate({
      path: "cancellation.refund.accountCorrection.requestedBy",
      select: "fullName",
    })
    .lean();

  return {
    _id: updated?._id,
    correction: updated?.cancellation?.refund?.accountCorrection,
  };
};

const processRefund = async ({ bookingId, process }) => {
  const updated = await Booking.findByIdAndUpdate(
    bookingId,
    {
      $set: {
        "cancellation.refund.reference": process?.reference || "",
        "cancellation.refund.refundedAt": process?.refundedAt,
        "cancellation.refund.processedBy": process?.processedBy,
        "cancellation.refund.status": "completed",
      },
    },
    { returnDocument: "after" },
  )
    .select("catering venue bookingType date")
    .lean();
  return { ...updated, amount: process.amount };
};

module.exports = {
  update,
  cancel,
  accountCorrection,
  processRefund,
};
