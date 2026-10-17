// booking/Setup.service.js

const mongoose = require("mongoose");
const Booking = require("../../../models/events/Booking");
const StockService = require("../../inventory/Stock.service");

const formattedIngredients = (catering) => {
  const { mainDishes, sideDishes } = catering;
  const dishes = [...(mainDishes ?? []), ...(sideDishes ?? [])];

  if (dishes.length === 0) {
    throw new Error("No dishes found");
  }

  const ingredients = dishes?.flatMap(({ ingredients }) => ingredients);

  if (ingredients.length === 0) {
    throw new Error("No ingredients found");
  }

  return ingredients;
};

const confirmSetup = async ({ bookingId, user }) => {
  return mongoose.connection.transaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking?._id) throw new Error("Booking not found");

    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can proceed to setup");
    }

    const { bookingType = "" } = booking;

    if (bookingType !== "venue") {
      await StockService.deduct({
        ingredients: formattedIngredients(booking?.catering),
        user,
        source: "catering",
        quantityKey: "requiredQty",
        session,
      });
    }

    booking.statusHistory.push({
      status: "setup",
      changedBy: user,
      changedAt: new Date(),
    });
    booking.status = "setup";

    await booking.save({ session });

    return booking;
  });
};

module.exports = { confirmSetup };
