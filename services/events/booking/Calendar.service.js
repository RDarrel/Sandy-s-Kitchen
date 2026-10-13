const Booking = require("../../../models/events/Booking");
const Payment = require("../../../models/events/Payment");
const { DateTime } = require("luxon");
const { attachPaymentsToBookings } = require("./helpers/attachPayments");
const dateToUTC = require("../../../utilities/dateToUTC");
const { attachRecipes } = require("../menu/helpers/attachRecipe");

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

        // Financial overview for the selected month
        financial: [
          {
            $match: {
              ...scheduleMatch(selectedMonthStart, selectedMonthEnd),
              status: {
                $in: ["approved", "confirmed", "setup", "completed"],
              },
            },
          },

          // Get verified payments for each booking
          {
            $lookup: {
              from: Payment.collection.name,
              let: {
                bookingId: "$_id",
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$booking", "$$bookingId"],
                        },
                        {
                          $eq: ["$status", "verified"],
                        },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: {
                      $sum: "$amount",
                    },
                  },
                },
              ],
              as: "payments",
            },
          },

          // Calculate received payments per booking
          {
            $addFields: {
              received: {
                $ifNull: [
                  {
                    $arrayElemAt: ["$payments.total", 0],
                  },
                  0,
                ],
              },
            },
          },

          // Calculate financial totals
          {
            $group: {
              _id: null,
              totalValue: {
                $sum: "$pricing.total",
              },
              received: {
                $sum: "$received",
              },
            },
          },

          {
            $project: {
              _id: 0,
              totalValue: 1,
              received: 1,
            },
          },
        ],
      },
    },
  ]);

  return {
    days: result.calendar,
    overview: {
      totalBookings: result.totalBookings[0]?.count ?? 0,

      statuses: Object.fromEntries(
        result.monthlyOverview.map(({ status, count }) => [status, count]),
      ),

      financial: result.financial[0] ?? {
        totalValue: 0,
        received: 0,
      },
    },
  };
};

const attachRecipesToDishes = async (bookings) => {
  if (bookings?.length === 0) return [];
  const menusMap = new Map();

  const menus = [
    ...new Map(
      bookings.flatMap(({ catering }) => {
        const { mainDishes = [], sideDishes = [] } = catering ?? {};

        return [...(mainDishes ?? []), ...(sideDishes ?? [])]
          .map(({ menu }) => menu)
          .filter((menu) => menu?._id)
          .map((menu) => [menu._id.toString(), menu]);
      }),
    ).values(),
  ];

  if (!menus.length) return bookings;

  const menusWithRecipes = await attachRecipes(menus);

  //attach menu to new mapmay ne

  menusWithRecipes.forEach((menu) => menusMap.set(String(menu?._id), menu));

  return bookings?.map((booking) => {
    if (booking?.bookingType === "venue") return booking;

    const { mainDishes = [], sideDishes = [] } = booking?.catering;
    const getDishesWithRecipe = (datas = []) =>
      datas.map((data) => ({
        ...data,
        menu: menusMap.get(String(data?.menu?._id)),
      }));

    return {
      ...booking,
      catering: {
        ...booking?.catering,
        mainDishes: getDishesWithRecipe(mainDishes),
        sideDishes: getDishesWithRecipe(sideDishes),
      },
    };
  });
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
    .populate("catering.mainDishes.menu")
    .populate("catering.sideDishes.menu")
    .lean();

  const scheduleWithPayments = await attachPaymentsToBookings({
    bookings: schedule,
  });

  const formattedSchedule = await attachRecipesToDishes(scheduleWithPayments);

  const statusOrder = [
    "pending",
    "approved",
    "confirmed",
    "setup",
    "completed",
    "cancelled",
  ];

  const groupedSchedule = formattedSchedule.reduce((acc, booking) => {
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
  calendar,
  schedule,
};
