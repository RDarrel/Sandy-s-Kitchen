const Payment = require("../../../../models/events/Payment");

const attachPaymentsToBookings = async ({ bookings }) => {
  /*
   * Get all booking IDs from today's schedule.
   */
  const bookingIds = bookings.map(({ _id }) => _id);

  /*
   * ONE query for all payments belonging
   * to these bookings.
   */
  const payments = await Payment.find({
    booking: {
      $in: bookingIds,
    },
  })
    .populate("method", "name")
    .populate("reviewedBy", "fullName")
    .sort({
      paidAt: -1,
    })
    .lean();

  /*
   * Group payments by booking ID.
   *
   * Result:
   *
   * {
   *   bookingId1: [payment1, payment2],
   *   bookingId2: [payment3],
   * }
   */
  const paymentsByBooking = payments.reduce((acc, payment) => {
    const bookingId = payment.booking.toString();

    if (!acc[bookingId]) {
      acc[bookingId] = [];
    }

    acc[bookingId].push(payment);

    return acc;
  }, {});

  /*
   * Attach payments to each booking.
   */
  return bookings.map((booking) => ({
    ...booking,
    payments: paymentsByBooking[booking._id.toString()] || [],
  }));
};

module.exports = {
  attachPaymentsToBookings,
};
