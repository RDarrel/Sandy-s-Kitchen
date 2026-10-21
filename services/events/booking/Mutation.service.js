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
  ).lean();
  return updated;
};

module.exports = {
  update,
  cancel,
};
