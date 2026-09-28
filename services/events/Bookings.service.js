const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
const Equipment = require("../../models/inventory/Equipment");
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

const getMyBookings = async ({ customer }) => {
  const bookings = await Booking.find({ customer })
    .populate({
      path: "catering.item",
      select: "inclusions name description",
      populate: { path: "inclusions.item" },
    })
    .populate({
      path: "venue.item",
      populate: { path: "inclusions.item" },
    })
    .populate("catering.mainDishes")
    .populate("catering.sideDishes")
    .lean();

  return await attachPaymentsToBookings({ bookings });
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

  const scheduleWithPayments = await attachPaymentsToBookings({
    bookings: schedule,
  });

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

const addUsage = (event) =>
  event?.inclusions
    ?.filter(({ model }) => model === "Equipment")
    .map((inc) => ({
      ...inc,
      usage: event?.time,
    })) || [];

const getEquipments = (booking) => {
  const { venue, catering } = booking;
  const venueInclusions = addUsage(venue);
  const cateringInclusions = addUsage(catering);
  return [...venueInclusions, ...cateringInclusions];
};

const getEquipmentAvailability = async ({ bookingID }) => {
  const populatedBooking = await Booking.findOne({ _id: bookingID }).lean();
  const conflictingBookings = await Booking.find({
    _id: { $ne: bookingID },

    date: dateToUTC({
      date: populatedBooking.date,
      dateOnly: true,
    }),

    status: {
      $in: ["approved", "confirmed", "setup"],
    },
  })
    .select("venue.time venue.inclusions catering.time catering.inclusions")
    .lean();

  const reservedEquipments = conflictingBookings.flatMap((book) =>
    getEquipments(book),
  );

  const pendingEquipments = getEquipments(populatedBooking);
  const pendingEquipmentIDS = [
    ...new Set(pendingEquipments.map(({ item }) => item.toString())),
  ];

  const equipments = await Equipment.find({
    _id: { $in: pendingEquipmentIDS },
  })
    .select("totalQty")
    .lean();

  const equipmentsWithAmtUsage = pendingEquipments.map((p) => {
    const affectedEquipments = reservedEquipments.filter(
      ({ usage, item }) =>
        usage.start < p.usage.end &&
        usage.end > p.usage.start &&
        item.toString() === p.item.toString(),
    );
    const getFormattedTimes = (key) => {
      return affectedEquipments.map(({ usage, amount }) => ({
        hour: usage[key],
        isStart: key === "start",
        amount,
      }));
    };

    const times = [
      ...getFormattedTimes("start"),
      ...getFormattedTimes("end"),
    ].sort((a, b) => {
      const timeComparison = a.hour.localeCompare(b.hour);
      // Different times → chronological order
      if (timeComparison !== 0) return timeComparison;

      // Same time → END first, then START
      if (a.isStart === b.isStart) return 0;

      return a.isStart ? 1 : -1;
    });

    let peakAmount = 0;
    let currentTotalAmount = 0;

    times.forEach((element) => {
      if (element?.isStart) {
        currentTotalAmount += element.amount;
      } else {
        currentTotalAmount -= element?.amount;
      }
      peakAmount = Math.max(peakAmount, currentTotalAmount);
    });

    return { ...p, totalAmt: peakAmount };
  });

  const availability = equipments.map((e) => {
    const totalAmtReserved = Math.max(
      0,
      ...equipmentsWithAmtUsage
        .filter(({ item }) => e._id.toString() === item.toString())
        .map(({ totalAmt }) => totalAmt),
    );

    return {
      ...e,
      available: totalAmtReserved ? e.totalQty - totalAmtReserved : e.totalQty,
    };
  });

  const availabilityMap = Object.fromEntries(
    availability.map(({ _id, available }) => [
      _id.toString(),
      { catering: available, venue: available, available },
    ]),
  );

  return availabilityMap;
};

module.exports = {
  approve,
  calendar,
  schedule,
  getEquipmentAvailability,
  getMyBookings,
};
