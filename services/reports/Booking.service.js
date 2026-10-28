const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
const dateToUTC = require("../../utilities/dateToUTC");
const { DateTime } = require("luxon");

const getPaymentReport = async ({
  startDate,
  endDate,
  frequency = "daily",
}) => {
  const units = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = Object.hasOwn(units, frequency) ? units[frequency] : "day";

  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  if (
    !start ||
    !end ||
    Number.isNaN(new Date(start).getTime()) ||
    Number.isNaN(new Date(end).getTime()) ||
    new Date(start).getTime() > new Date(end).getTime()
  ) {
    const error = new Error("A valid startDate and endDate are required.");
    error.status = 400;
    throw error;
  }

  const dateFilter = {
    $gte: start,
    $lte: end,
  };

  const [result] = await Payment.aggregate([
    {
      $match: {
        createdAt: dateFilter,
        status: {
          $in: ["pending", "verified", "voided"],
        },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalCollected: {
                $sum: {
                  $cond: [{ $eq: ["$status", "verified"] }, "$amount", 0],
                },
              },

              totalVerified: {
                $sum: {
                  $cond: [{ $eq: ["$status", "verified"] }, 1, 0],
                },
              },

              totalPending: {
                $sum: {
                  $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                },
              },

              pendingAmount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
                },
              },

              totalVoided: {
                $sum: {
                  $cond: [{ $eq: ["$status", "voided"] }, 1, 0],
                },
              },

              voidedAmount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "voided"] }, "$amount", 0],
                },
              },

              totalPayments: {
                $sum: 1,
              },
            },
          },
          {
            $addFields: {
              averagePayment: {
                $cond: [
                  { $gt: ["$totalVerified", 0] },
                  {
                    $divide: ["$totalCollected", "$totalVerified"],
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],

        payments: [
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $lookup: {
              from: "bookings",
              localField: "booking",
              foreignField: "_id",
              as: "booking",
            },
          },
          {
            $unwind: {
              path: "$booking",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              amount: 1,
              status: 1,
              createdAt: 1,
              method: 1,
              reviewedBy: 1,
              reviewedAt: 1,
              snapshot: 1,
              type: 1,
              reference: 1,
              proofImgId: 1,
              notes: 1,
              rejectionReason: 1,

              booking: {
                _id: "$booking._id",
                reference: "$booking.reference",
                customer: "$booking.customer",
                totalAmount: "$booking.totalAmount",
                eventDate: "$booking.eventDate",
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "booking.customer",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                  },
                },
              ],
              as: "booking.customer",
            },
          },
          {
            $unwind: {
              path: "$booking.customer",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "paymentmethods",
              localField: "method",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    type: 1,
                  },
                },
              ],
              as: "method",
            },
          },
          {
            $unwind: {
              path: "$method",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "reviewedBy",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                  },
                },
              ],
              as: "reviewedBy",
            },
          },
          {
            $unwind: {
              path: "$reviewedBy",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
  ]);

  const [refundResult] = await Booking.aggregate([
    {
      $match: {
        "cancellation.refund.status": {
          $in: ["pending", "completed"],
        },
      },
    },
    {
      $addFields: {
        transactionDate: {
          $cond: [
            {
              $eq: ["$cancellation.refund.status", "completed"],
            },
            "$cancellation.refund.refundedAt",
            {
              $ifNull: [
                "$cancellation.refund.accountProvidedAt",
                "$cancellation.cancelledAt",
              ],
            },
          ],
        },
      },
    },
    {
      $match: {
        transactionDate: dateFilter,
      },
    },
    {
      $facet: {
        summary: [
          {
            $match: {
              "cancellation.refund.status": "completed",
            },
          },
          {
            $group: {
              _id: null,

              totalRefunds: {
                $sum: 1,
              },

              totalRefundedAmount: {
                $sum: {
                  $ifNull: ["$cancellation.refund.amount", 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],

        refunds: [
          {
            $sort: {
              transactionDate: -1,
              _id: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "customer",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                  },
                },
              ],
              as: "customer",
            },
          },
          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              reference: 1,
              customer: 1,
              totalAmount: 1,
              status: 1,
              cancellation: 1,
              eventType: 1,
              transactionDate: 1,
            },
          },
        ],
      },
    },
  ]);

  // Keep the original populated refund fields.
  const refunds = await Booking.populate(refundResult?.refunds || [], [
    {
      path: "customer",
      select: "fullName",
    },
    {
      path: "cancellation.refund.processedBy",
      select: "fullName",
    },
    {
      path: "cancellation.refund.method",
    },
    {
      path: "cancellation.refund.accountProvidedByUser",
      select: "fullName",
    },
  ]);

  const refundSummary = refundResult?.summary?.[0] || {
    totalRefunds: 0,
    totalRefundedAmount: 0,
  };

  const formattedRefunds = refunds.map((res) => {
    const { cancellation } = res;
    const { refund } = cancellation;

    return {
      booking: {
        _id: res?._id,
        reference: res?.reference,
        customer: res?.customer,
        eventType: res?.eventType,
      },
      transactionType: "refund",
      ...refund,
      totalPaid: cancellation?.totalPaid,
      nonRefundableAmount: cancellation?.nonRefundableAmount,
      cancellationReason: cancellation?.reason,
      reviewedAt: refund?.refundedAt,
      reviewedBy: refund?.processedBy,
      createdAt: res.transactionDate,
    };
  });

  // Merge payments and refunds without combining
  // individual transaction records.
  const payments = [...(result?.payments ?? []), ...formattedRefunds].sort(
    (a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();

      const dateDifference =
        (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);

      if (dateDifference) {
        return dateDifference;
      }

      const aKey = `${
        a.transactionType || "payment"
      }:${a._id || a.booking?._id || ""}`;

      const bKey = `${
        b.transactionType || "payment"
      }:${b._id || b.booking?._id || ""}`;

      return bKey.localeCompare(aKey);
    },
  );

  // Group transactions by Manila date/week/month/year.
  const groups = new Map();

  for (const payment of payments) {
    const timestamp = new Date(payment.createdAt);

    // Skip records with invalid transaction dates.
    if (Number.isNaN(timestamp.getTime())) {
      continue;
    }

    const periodDate = DateTime.fromJSDate(timestamp, {
      zone: "Asia/Manila",
    }).startOf(unit);

    if (!periodDate.isValid) {
      continue;
    }

    const period = periodDate.toUTC().toISO();

    if (!groups.has(period)) {
      groups.set(period, {
        date: period,
        items: [],
        totalAmount: 0,
      });
    }

    const group = groups.get(period);

    // Always retain the original individual transaction.
    group.items.push(payment);

    const amount = Number(payment.amount ?? 0);

    if (payment.transactionType === "refund") {
      // Completed refunds reduce Net Collections.
      if (payment.status === "completed") {
        group.totalAmount -= amount;
      }
    } else if (payment.status === "verified") {
      // Only verified payments increase Net Collections.
      group.totalAmount += amount;
    }
  }

  const paymentBreakdown = [...groups.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const paymentSummary = result?.summary?.[0] || {};

  const totalCollected = paymentSummary.totalCollected ?? 0;

  const totalRefundedAmount = refundSummary.totalRefundedAmount ?? 0;

  return {
    summary: {
      totalCollected: 0,
      totalVerified: 0,
      totalPending: 0,
      pendingAmount: 0,
      totalVoided: 0,
      voidedAmount: 0,
      totalPayments: 0,
      averagePayment: 0,

      ...paymentSummary,
      ...refundSummary,

      netCollections: totalCollected - totalRefundedAmount,
    },

    payments: paymentBreakdown,
  };
};

const getSalesReport = async ({ startDate, endDate }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const [result] = await Booking.aggregate([
    {
      $match: {
        status: {
          $in: ["confirmed", "setup", "completed"],
        },

        ...(start &&
          end && {
            $or: [
              {
                "catering.schedule.startAt": {
                  $gte: start,
                  $lte: end,
                },
              },
              {
                "venue.schedule.startAt": {
                  $gte: start,
                  $lte: end,
                },
              },
            ],
          }),
      },
    },

    // Get payment records for every booking
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
                $eq: ["$booking", "$$bookingId"],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $lookup: {
              from: "paymentmethods",
              localField: "method",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    type: 1,
                  },
                },
              ],
              as: "method",
            },
          },
          {
            $unwind: {
              path: "$method",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "reviewedBy",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                  },
                },
              ],
              as: "reviewedBy",
            },
          },
          {
            $unwind: {
              path: "$reviewedBy",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              amount: 1,
              status: 1,
              createdAt: 1,
              reviewedAt: 1,
              method: 1,
              reviewedBy: 1,
              snapshot: 1,
              type: 1,
              reference: 1,
              proofImgId: 1,
              notes: 1,
              rejectionReason: 1,
            },
          },
        ],
        as: "payments",
      },
    },

    // Sum verified payments only
    {
      $addFields: {
        totalPaid: {
          $sum: {
            $map: {
              input: "$payments",
              as: "payment",
              in: {
                $cond: [
                  {
                    $eq: ["$$payment.status", "verified"],
                  },
                  {
                    $ifNull: ["$$payment.amount", 0],
                  },
                  0,
                ],
              },
            },
          },
        },
      },
    },

    // Calculate remaining balance
    {
      $addFields: {
        outstandingBalance: {
          $max: [
            {
              $subtract: [
                {
                  $ifNull: ["$pricing.total", 0],
                },
                "$totalPaid",
              ],
            },
            0,
          ],
        },
      },
    },

    // Return summary and booking records
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalBookingValue: {
                $sum: {
                  $ifNull: ["$pricing.total", 0],
                },
              },

              totalPaidAmount: {
                $sum: "$totalPaid",
              },

              outstandingBalance: {
                $sum: "$outstandingBalance",
              },

              totalBookings: {
                $sum: 1,
              },
            },
          },
          {
            $addFields: {
              averageBookingValue: {
                $cond: [
                  {
                    $gt: ["$totalBookings", 0],
                  },
                  {
                    $divide: ["$totalBookingValue", "$totalBookings"],
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],

        bookings: [
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "customer",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                  },
                },
              ],
              as: "customer",
            },
          },
          {
            $unwind: {
              path: "$customer",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
  ]);
  const bookings = await Booking.populate(result?.bookings || [], [
    { path: "catering.mainDishes.menu" },
    { path: "catering.sideDishes.menu" },
    { path: "catering.item" },
    { path: "venue.item" },
    { path: "catering.inclusions.item" },
    { path: "venue.inclusions.item" },
  ]);

  return {
    summary: result?.summary?.[0] || {
      totalBookingValue: 0,
      totalPaidAmount: 0,
      outstandingBalance: 0,
      totalBookings: 0,
      averageBookingValue: 0,
    },

    bookings: bookings || [],
  };
};

const getAnalytics = async ({ startDate, endDate }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  if (!start || !end || start > end) {
    const error = new Error("A valid startDate and endDate are required.");
    error.status = 400;
    throw error;
  }

  // IMPORTANT:
  // Replace these with the actual pricing paths
  // from your Booking schema.
  //
  // These must represent the individual package
  // and venue amounts, NOT the entire booking total.
  const PACKAGE_VALUE_PATH = "$pricing.catering.total";
  const VENUE_VALUE_PATH = "$pricing.venue.total";

  // Group and limit before joining names:
  // only the five ranked records need lookups.
  const ranking = (
    field,
    collection,
    fallback,
    extra = [],
    valueField = "$value",
  ) => [
    {
      $match: {
        [field]: { $ne: null },
      },
    },
    {
      $group: {
        _id: `$${field}`,
        bookings: { $sum: 1 },

        // Each ranking can use its own value source.
        value: {
          $sum: {
            $ifNull: [valueField, 0],
          },
        },

        contactName: {
          $first: "$contact.name",
        },
      },
    },
    {
      $sort: {
        bookings: -1,
        value: -1,
        _id: 1,
      },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: collection,
        localField: "_id",
        foreignField: "_id",
        as: "item",
        pipeline: [
          {
            $project:
              collection === "users"
                ? { fullName: 1 }
                : { name: 1, category: 1 },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$item",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...extra,
    {
      $project: {
        _id: 1,
        bookings: 1,
        value: 1,

        name:
          collection === "users"
            ? {
                $ifNull: [
                  "$item.fullName",
                  {
                    $ifNull: ["$contactName", fallback],
                  },
                ],
              }
            : {
                $ifNull: ["$item.name", fallback],
              },

        ...(collection === "menus" && {
          category: {
            $ifNull: ["$category.name", "Uncategorized"],
          },
        }),
      },
    },
  ];

  const inPeriod = (field) => ({
    $and: [{ $gte: [field, start] }, { $lte: [field, end] }],
  });

  const [result] = await Booking.aggregate([
    {
      $match: {
        status: {
          $in: ["confirmed", "setup", "completed"],
        },

        deletedAt: null,

        $or: [
          {
            "catering.schedule.startAt": {
              $gte: start,
              $lte: end,
            },
          },
          {
            "venue.schedule.startAt": {
              $gte: start,
              $lte: end,
            },
          },
        ],
      },
    },
    {
      $project: {
        "catering.item": 1,
        "venue.item": 1,
        customer: 1,
        "contact.name": 1,

        "catering.mainDishes.menu": 1,
        "catering.sideDishes.menu": 1,

        // Entire booking value:
        // Used by summary, trends, dishes,
        // and customers as before.
        value: {
          $ifNull: ["$pricing.total", 0],
        },

        // Individual package value only.
        packageValue: {
          $ifNull: [PACKAGE_VALUE_PATH, 0],
        },

        // Individual venue value only.
        venueValue: {
          $ifNull: [VENUE_VALUE_PATH, 0],
        },

        // Count a combined booking once,
        // using its earliest schedule inside
        // the selected date range.
        eventDate: {
          $cond: [
            inPeriod("$catering.schedule.startAt"),
            {
              $cond: [
                inPeriod("$venue.schedule.startAt"),
                {
                  $min: [
                    "$catering.schedule.startAt",
                    "$venue.schedule.startAt",
                  ],
                },
                "$catering.schedule.startAt",
              ],
            },
            "$venue.schedule.startAt",
          ],
        },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,

              totalBookings: {
                $sum: 1,
              },

              totalBookingValue: {
                $sum: "$value",
              },

              averageBookingValue: {
                $avg: "$value",
              },
            },
          },
          {
            $project: {
              _id: 0,
            },
          },
        ],

        trends: [
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: "$eventDate",
                  unit: "month",
                  timezone: "Asia/Manila",
                },
              },

              bookings: {
                $sum: 1,
              },

              value: {
                $sum: "$value",
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              bookings: 1,
              value: 1,
            },
          },
        ],

        // Only package amounts are summed.
        packages: ranking(
          "catering.item",
          "cateringpackages",
          "Unknown package",
          [],
          "$packageValue",
        ),

        // Only venue amounts are summed.
        venues: ranking(
          "venue.item",
          "venues",
          "Unknown venue",
          [],
          "$venueValue",
        ),

        dishes: [
          // A dish appearing in both lists
          // still counts only once per booking.
          {
            $set: {
              dish: {
                $setUnion: [
                  {
                    $ifNull: ["$catering.mainDishes.menu", []],
                  },
                  {
                    $ifNull: ["$catering.sideDishes.menu", []],
                  },
                ],
              },
            },
          },
          {
            $unwind: "$dish",
          },
          ...ranking("dish", "menus", "Unknown dish", [
            {
              $lookup: {
                from: "menucategories",
                localField: "item.category",
                foreignField: "_id",
                as: "category",
              },
            },
            {
              $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
              },
            },
          ]),
        ],

        customers: ranking("customer", "users", "Unknown customer"),
      },
    },
  ]);

  const summary = result?.summary?.[0] || {
    totalBookings: 0,
    totalBookingValue: 0,
    averageBookingValue: 0,
  };

  const rankings = {};

  for (const key of ["packages", "venues", "dishes", "customers"]) {
    rankings[key] = (result?.[key] || []).map((row) => ({
      ...row,

      percentage: summary.totalBookings
        ? (row.bookings / summary.totalBookings) * 100
        : 0,
    }));
  }

  return {
    summary,
    trends: result?.trends || [],
    ...rankings,
  };
};

module.exports = {
  getPaymentReport,
  getSalesReport,
  getAnalytics,
};
