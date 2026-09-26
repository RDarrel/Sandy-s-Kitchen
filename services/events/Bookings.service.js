const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
const BookingPolicy = require("../../models/events/BookingPolicy");
const dateToUTC = require("../../utilities/dateToUTC");

/*
|--------------------------------------------------------------------------
| Calculate Booking Terms
|--------------------------------------------------------------------------
*/

const calculateTerms = ({ booking, policy }) => {
  const approvedAt = new Date();

  /*
  |--------------------------------------------------------------------------
  | Required Deposit
  |--------------------------------------------------------------------------
  */

  const requiredDeposit =
    Math.round(booking.pricing.total * (policy.depositPercent / 100) * 100) /
    100;

  /*
  |--------------------------------------------------------------------------
  | Deposit Deadline
  |--------------------------------------------------------------------------
  |
  | The customer must submit the required deposit within the configured
  | reservation hold period after the booking has been approved.
  |
  */

  const depositDeadline = new Date(
    approvedAt.getTime() + policy.reservationHoldHours * 60 * 60 * 1000,
  );

  /*
  |--------------------------------------------------------------------------
  | Cancellation Deadline
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | Event Date:            November 20
  | Cancellation Policy:   7 days
  | Cancellation Deadline: November 13
  |
  */

  const cancellationDeadline = new Date(booking.date);

  cancellationDeadline.setDate(
    cancellationDeadline.getDate() - policy.cancellationDeadlineDays,
  );

  /*
  |--------------------------------------------------------------------------
  | Balance Due Date
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | Event Date:       November 20
  | Balance Due:      2 days before
  | Balance Due Date: November 18
  |
  */

  const balanceDueAt = new Date(booking.date);

  balanceDueAt.setDate(
    balanceDueAt.getDate() - policy.balanceDueDaysBeforeEvent,
  );

  /*
  |--------------------------------------------------------------------------
  | Booking Terms Snapshot
  |--------------------------------------------------------------------------
  */

  return {
    depositPercent: policy.depositPercent,

    requiredDeposit,

    reservationHoldHours: policy.reservationHoldHours,

    depositDeadline,

    cancellationDeadlineDays: policy.cancellationDeadlineDays,

    cancellationDeadline,

    depositRefundable: policy.depositRefundable,

    balanceDueDaysBeforeEvent: policy.balanceDueDaysBeforeEvent,

    balanceDueAt,

    approvedAt,
  };
};

/*
|--------------------------------------------------------------------------
| Approve Booking
|--------------------------------------------------------------------------
*/

const approve = async ({
  _id,
  eInclusions = [],
  cInclusions = [],
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

  booking.status = "approved";

  booking.terms = terms;

  if (cInclusions.length > 0 && booking.catering) {
    booking.catering.inclusions = cInclusions;
  }

  if (eInclusions.length > 0 && booking.venue) {
    booking.venue.inclusions = eInclusions;
  }

  booking.statusHistory.push({
    status: "approved",
    changedBy: userId,
    changedAt: terms.approvedAt,
  });

  await booking.save();

  await booking.populate([
    {
      path: "catering.item",
      select: "inclusions name description",
      populate: {
        path: "inclusions.item",
      },
    },
    {
      path: "venue.item",
      populate: {
        path: "inclusions.item",
      },
    },
  ]);

  return booking;
};

const calendar = async ({ start, end, monthStart, monthEnd }) => {
  const [result] = await Booking.aggregate([
    // Exclude rejected bookings from everything
    {
      $match: {
        status: { $nin: ["rejected"] },
      },
    },

    {
      $facet: {
        // Calendar visible range
        calendar: [
          {
            $match: {
              date: {
                $gte: dateToUTC({
                  date: start,
                  dateOnly: true,
                }),
                $lt: dateToUTC({
                  date: end,
                  dateOnly: true,
                }),
              },
            },
          },

          // Count bookings per date and status
          {
            $group: {
              _id: {
                date: "$date",
                status: "$status",
              },
              count: {
                $sum: 1,
              },
            },
          },

          // Group all status counts under each date
          {
            $group: {
              _id: "$_id.date",

              statusCounts: {
                $push: {
                  k: "$_id.status",
                  v: "$count",
                },
              },
            },
          },

          // Format calendar event
          {
            $project: {
              _id: 0,

              start: "$_id",
              end: "$_id",

              statusCounts: {
                $arrayToObject: "$statusCounts",
              },
            },
          },

          // Sort by date
          {
            $sort: {
              start: 1,
            },
          },
        ],

        // Exact selected month only
        monthlyOverview: [
          {
            $match: {
              date: {
                $gte: dateToUTC({
                  date: monthStart,
                  dateOnly: true,
                }),
                $lt: dateToUTC({
                  date: monthEnd,
                  dateOnly: true,
                }),
              },
            },
          },

          // Count bookings per status
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1,
            },
          },
        ],

        // Total bookings for exact selected month
        totalBookings: [
          {
            $match: {
              date: {
                $gte: dateToUTC({
                  date: monthStart,
                  dateOnly: true,
                }),
                $lt: dateToUTC({
                  date: monthEnd,
                  dateOnly: true,
                }),
              },
            },
          },

          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  return result;
};

const schedule = async ({ date }) => {
  const schedule = await Booking.find({
    date: dateToUTC({
      date,
      dateOnly: true,
    }),

    status: {
      $nin: ["rejected"],
    },
  })
    .populate("customer", "fullName")
    .populate("catering.item", "name description")
    .populate("venue.item", "name description address")
    .populate("catering.inclusions.item")
    .populate("venue.inclusions.item")
    .populate("catering.mainDishes")
    .populate("catering.sideDishes")
    .lean();

  /*
   * Get all booking IDs from today's schedule.
   */
  const bookingIds = schedule.map(({ _id }) => _id);

  /*
   * ONE query for all payments belonging
   * to these bookings.
   */
  const payments = await Payment.find({
    booking: {
      $in: bookingIds,
    },
  })
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
  const scheduleWithPayments = schedule.map((booking) => ({
    ...booking,
    payments: paymentsByBooking[booking._id.toString()] || [],
  }));

  const statusOrder = [
    "pending",
    "approved",
    "confirmed",
    "setup",
    "completed",
    "cancelled",
  ];

  const groupedSchedule = scheduleWithPayments.reduce((acc, booking) => {
    const status = booking.status;

    if (!acc[status]) {
      acc[status] = [];
    }

    acc[status].push(booking);

    return acc;
  }, {});

  return Object.fromEntries(
    statusOrder
      .filter((status) => groupedSchedule[status])
      .map((status) => [status, groupedSchedule[status]]),
  );
};

module.exports = {
  approve,
  calendar,
  schedule,
};
