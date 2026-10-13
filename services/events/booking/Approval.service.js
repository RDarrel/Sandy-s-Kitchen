const Booking = require("../../../models/events/Booking");
const BookingPolicy = require("../../../models/events/BookingPolicy");
const { calculateTerms } = require("./helpers/calculateTerms");

const approve = async ({
  _id,
  eInclusions = [],
  cInclusions = [],
  status = "approved",
  userId = null,
}) => {
  const booking = await Booking.findById(_id);

  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== "pending") {
    const error = new Error("Only pending bookings can be approved.");

    error.statusCode = 400;

    throw error;
  }

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

  booking.status = status;

  booking.terms = terms;

  if (cInclusions.length > 0 && booking.catering) {
    booking.catering.inclusions = cInclusions;
  }

  if (eInclusions.length > 0 && booking.venue) {
    booking.venue.inclusions = eInclusions;
  }

  booking.statusHistory.push({
    status,
    changedBy: userId,
    changedAt: terms.approvedAt,
  });

  await booking.save();

  await booking.populate([
    {
      path: "catering.inclusions.item",
    },
    {
      path: "venue.inclusions.item",
    },
  ]);

  return booking;
};

module.exports = {
  approve,
};
