const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
const Equipment = require("../../models/inventory/Equipment");
const BookingPolicy = require("../../models/events/BookingPolicy");
const dateToUTC = require("../../utilities/dateToUTC");
const { DateTime } = require("luxon");

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
  const timezone = "Asia/Manila";

  const calendarStart = dateToUTC({
    date: start,
    dateOnly: true,
  });

  const calendarEnd = dateToUTC({
    date: end,
    dateOnly: true,
  });

  const selectedMonthStart = dateToUTC({
    date: monthStart,
    dateOnly: true,
  });

  const selectedMonthEnd = dateToUTC({
    date: monthEnd,
    dateOnly: true,
  });

  if (
    !calendarStart ||
    !calendarEnd ||
    !selectedMonthStart ||
    !selectedMonthEnd
  ) {
    throw new Error("Invalid calendar date range.");
  }

  if (calendarStart >= calendarEnd || selectedMonthStart >= selectedMonthEnd) {
    throw new Error("Invalid calendar date range.");
  }

  // Generate all visible calendar dates
  const days = [];

  let current = DateTime.fromJSDate(calendarStart, {
    zone: timezone,
  });

  const last = DateTime.fromJSDate(calendarEnd, {
    zone: timezone,
  });

  while (current < last) {
    const next = current.plus({ days: 1 });

    days.push({
      start: current.startOf("day").toUTC().toJSDate(),
      end: current.endOf("day").toUTC().toJSDate(),
      nextStart: next.startOf("day").toUTC().toJSDate(),
    });

    current = next;
  }

  // Check if either service overlaps the given range
  const scheduleMatch = (rangeStart, rangeEnd) => ({
    $or: [
      {
        "catering.schedule.startAt": { $lt: rangeEnd },
        "catering.schedule.endAt": { $gt: rangeStart },
      },
      {
        "venue.schedule.startAt": { $lt: rangeEnd },
        "venue.schedule.endAt": { $gt: rangeStart },
      },
    ],
  });

  const [result] = await Booking.aggregate([
    {
      $match: {
        status: {
          $nin: ["rejected", "changes_requested"],
        },
      },
    },

    {
      $facet: {
        // Calendar visible range
        calendar: [
          {
            $match: scheduleMatch(calendarStart, calendarEnd),
          },

          // Create one calendar entry per matching booking per day
          {
            $project: {
              status: 1,

              dates: {
                $filter: {
                  input: {
                    $literal: days,
                  },
                  as: "day",
                  cond: {
                    $or: [
                      {
                        $and: [
                          {
                            $lt: [
                              "$catering.schedule.startAt",
                              "$$day.nextStart",
                            ],
                          },
                          {
                            $gt: ["$catering.schedule.endAt", "$$day.start"],
                          },
                        ],
                      },
                      {
                        $and: [
                          {
                            $lt: ["$venue.schedule.startAt", "$$day.nextStart"],
                          },
                          {
                            $gt: ["$venue.schedule.endAt", "$$day.start"],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },

          {
            $unwind: "$dates",
          },

          // Count bookings per date and status
          {
            $group: {
              _id: {
                date: "$dates.start",
                status: "$status",
              },
              count: {
                $sum: 1,
              },
            },
          },

          // Group status counts under each date
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

              end: {
                $dateSubtract: {
                  startDate: {
                    $dateAdd: {
                      startDate: "$_id",
                      unit: "day",
                      amount: 1,
                    },
                  },
                  unit: "millisecond",
                  amount: 1,
                },
              },

              statusCounts: {
                $arrayToObject: "$statusCounts",
              },
            },
          },

          {
            $sort: {
              start: 1,
            },
          },
        ],

        // Unique bookings active during the selected month
        monthlyOverview: [
          {
            $match: scheduleMatch(selectedMonthStart, selectedMonthEnd),
          },

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

        // Total unique bookings active during the selected month
        totalBookings: [
          {
            $match: scheduleMatch(selectedMonthStart, selectedMonthEnd),
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
  const dayStart = dateToUTC({
    date,
    dateOnly: true,
  });

  if (!dayStart) {
    throw new Error("Invalid schedule date.");
  }
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const schedule = await Booking.find({
    $or: [
      {
        "catering.schedule.startAt": { $lt: dayEnd },
        "catering.schedule.endAt": { $gt: dayStart },
      },
      {
        "venue.schedule.startAt": { $lt: dayEnd },
        "venue.schedule.endAt": { $gt: dayStart },
      },
    ],

    status: {
      $nin: ["rejected", "changes_requested"],
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
      usage: {
        start: event?.schedule?.startAt,
        end: event?.schedule?.endAt,
      },
    })) || [];

const getEquipments = (booking) => {
  const { venue, catering } = booking;
  const venueInclusions = addUsage(venue);
  const cateringInclusions = addUsage(catering);
  return [...venueInclusions, ...cateringInclusions];
};

const getEquipmentAvailability = async ({ bookingID }) => {
  const populatedBooking = await Booking.findById(bookingID).lean();

  if (!populatedBooking) {
    throw new Error("Booking not found.");
  }

  const pendingEquipments = getEquipments(populatedBooking);

  if (!pendingEquipments.length) {
    return {};
  }

  const pendingEquipmentIDS = [
    ...new Set(pendingEquipments.map(({ item }) => item.toString())),
  ];

  // Find overall booking schedule boundaries
  const schedules = [
    populatedBooking?.venue?.schedule,
    populatedBooking?.catering?.schedule,
  ].filter((event) => event?.startAt && event?.endAt);

  const bookingStart = new Date(
    Math.min(...schedules.map(({ startAt }) => new Date(startAt).getTime())),
  );

  const bookingEnd = new Date(
    Math.max(...schedules.map(({ endAt }) => new Date(endAt).getTime())),
  );

  // Find bookings with overlapping catering or venue schedules
  const conflictingBookings = await Booking.find({
    _id: { $ne: bookingID },

    status: {
      $in: ["approved", "confirmed", "setup"],
    },

    $or: [
      {
        "venue.schedule.startAt": { $lt: bookingEnd },
        "venue.schedule.endAt": { $gt: bookingStart },
      },
      {
        "catering.schedule.startAt": { $lt: bookingEnd },
        "catering.schedule.endAt": { $gt: bookingStart },
      },
    ],
  })
    .select(
      "venue.schedule.startAt venue.schedule.endAt venue.inclusions " +
        "catering.schedule.startAt catering.schedule.endAt catering.inclusions",
    )
    .lean();

  const reservedEquipments = conflictingBookings.flatMap((booking) =>
    getEquipments(booking),
  );

  const equipments = await Equipment.find({
    _id: { $in: pendingEquipmentIDS },
  })
    .select("totalQty")
    .lean();

  const equipmentsWithAmtUsage = pendingEquipments.map((pending) => {
    const pendingStart = new Date(pending.usage.start).getTime();
    const pendingEnd = new Date(pending.usage.end).getTime();

    const affectedEquipments = reservedEquipments.filter(
      ({ usage, item }) =>
        item.toString() === pending.item.toString() &&
        new Date(usage.start).getTime() < pendingEnd &&
        new Date(usage.end).getTime() > pendingStart,
    );

    const times = affectedEquipments.flatMap(({ usage, amount }) => {
      const start = Math.max(new Date(usage.start).getTime(), pendingStart);

      const end = Math.min(new Date(usage.end).getTime(), pendingEnd);

      return [
        {
          time: start,
          isStart: true,
          amount,
        },
        {
          time: end,
          isStart: false,
          amount,
        },
      ];
    });

    times.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }

      // End before start at the same timestamp
      if (a.isStart === b.isStart) return 0;

      return a.isStart ? 1 : -1;
    });

    let peakAmount = 0;
    let currentTotalAmount = 0;

    times.forEach(({ isStart, amount }) => {
      currentTotalAmount += isStart ? amount : -amount;

      peakAmount = Math.max(peakAmount, currentTotalAmount);
    });

    return {
      ...pending,
      totalAmt: peakAmount,
    };
  });

  const availability = equipments.map((equipment) => {
    const totalAmtReserved = Math.max(
      0,
      ...equipmentsWithAmtUsage
        .filter(({ item }) => equipment._id.toString() === item.toString())
        .map(({ totalAmt }) => totalAmt),
    );

    return {
      ...equipment,
      available: Math.max(0, equipment.totalQty - totalAmtReserved),
    };
  });

  const availabilityMap = Object.fromEntries(
    availability.map(({ _id, available }) => [
      _id.toString(),
      {
        catering: available,
        venue: available,
        available,
      },
    ]),
  );

  return availabilityMap;
};

const getPaymentDetails = async ({ customer, reference }) => {
  const booking = await Booking.findOne({
    customer,
    reference,
  }).lean();

  if (!booking) return {};

  const [bookingWithPayments] = await attachPaymentsToBookings({
    bookings: [booking],
  });

  return bookingWithPayments;
};

const getBookingDetails = async ({ customer, reference }) => {
  const booking = await Booking.findOne({
    customer,
    reference,
  })
    .populate({
      path: "catering.item",
      populate: [
        {
          path: "mainCourseCategories.category",
          select: "name",
        },
        {
          path: "mainCourseCategories.choices",
          select: "name description",
        },
        {
          path: "sideMenuCategories.category",
          select: "name",
        },
        {
          path: "sideMenuCategories.choices",
          select: "name description",
        },
        {
          path: "inclusions.item",
          select: "name requirement category",
        },
      ],
    })
    .populate({
      path: "venue.item",
      populate: { path: "inclusions.item" },
    })
    .populate("catering.inclusions.item", "name category")
    .populate("venue.inclusions.item", "name category")
    .populate("catering.mainDishes")
    .populate("catering.sideDishes")
    .lean();

  if (!booking) return {};

  const [bookingWithPayments] = await attachPaymentsToBookings({
    bookings: [booking],
  });

  return bookingWithPayments;
};

const update = async ({ booking }) => {
  const updated = await Booking.findByIdAndUpdate(booking?._id, booking, {
    returnDocument: "after",
  })
    .select("_id status date statusHistory")
    .lean();
  return updated;
};

module.exports = {
  approve,
  calendar,
  schedule,
  getEquipmentAvailability,
  getMyBookings,
  getPaymentDetails,
  getBookingDetails,
  update,
};
