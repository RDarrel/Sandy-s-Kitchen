const Booking = require("../../../models/events/Booking");

const update = async ({ booking }) => {
  const updated = await Booking.findByIdAndUpdate(booking?._id, booking, {
    returnDocument: "after",
  })
    .select("_id status date statusHistory")
    .lean();
  return updated;
};

module.exports = {
  update,
};
