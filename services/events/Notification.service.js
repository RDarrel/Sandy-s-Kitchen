const Notfication = require("../../models/events/Notification");
const Booking = require("../../models/events/Booking");
const notifyBooking = async ({ statusTransaction, bookingId }) => {
  console.log("statusTransaction", statusTransaction);
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
    const booking = await Booking.findOne({ _id: bookingId });

    await Notfication.create({
      recipient: booking?.customer,
      type: `booking_${statusTransaction?.new}`,
      reference: booking?.reference,
    });
  }
};

module.exports = {
  notifyBooking,
};
