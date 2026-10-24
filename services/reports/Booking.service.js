const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
const dateToUTC = require("../../utilities/dateToUTC");

const getPaymentReport = async ({ startDate, endDate }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const [result] = await Payment.aggregate([
    {
      $match: {
        ...(start &&
          end && {
            createdAt: {
              $gte: start,
              $lte: end,
            },
          }),
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

              totalPayments: { $sum: 1 },
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
              pipeline: [{ $project: { fullName: 1 } }],
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
              pipeline: [{ $project: { name: 1, type: 1 } }],
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
              pipeline: [{ $project: { fullName: 1 } }],
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
        "cancellation.refund.status": "completed",

        ...(start &&
          end && {
            "cancellation.refund.refundedAt": {
              $gte: start,
              $lte: end,
            },
          }),
      },
    },

    {
      $facet: {
        summary: [
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
              "cancellation.refund.refundedAt": -1,
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
            },
          },
        ],
      },
    },
  ]);

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

  const formattedRefunds = refunds?.map((res) => {
    const { cancellation } = res;
    const { refund } = cancellation;
    return {
      booking: {
        _id: res?._id,
        reference: res?.reference,
        customer: res?.customer,
      },
      transactionType: "refund",
      ...refund,
      reviewedAt: refund?.refundedAt,
      reviewedBy: refund?.processedBy,
      createdAt: refund?.accountProvidedAt,
    };
  });

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

      ...(result?.summary?.[0] || {}),
      ...refundSummary,
    },
    refundSummary,
    payments: [...(result?.payments ?? []), ...(formattedRefunds ?? [])],
    refundsss: formattedRefunds[0],
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
                  $ifNull: ["$totalAmount", 0],
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

module.exports = {
  getPaymentReport,
  getSalesReport,
};
