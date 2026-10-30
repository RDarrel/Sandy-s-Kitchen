const Notfication = require("../../models/events/Notification");
const Booking = require("../../models/events/Booking");
const EmailService = require("../Email.service");
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
    const booking = await Booking.findOne({ _id: bookingId });

    await Notfication.create({
      recipient: booking?.customer,
      type: `booking_${statusTransaction?.new}`,
      reference: booking?.reference,
    });

    EmailService.send();
  }
};

module.exports = {
  notifyBooking,
};
