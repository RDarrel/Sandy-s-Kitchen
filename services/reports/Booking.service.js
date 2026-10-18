const Payment = require("../../models/events/Payment");
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
        ...(start && end && {
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

  return {
    summary: result?.summary?.[0] || {
      totalCollected: 0,
      totalVerified: 0,
      totalPending: 0,
      pendingAmount: 0,
      totalVoided: 0,
      voidedAmount: 0,
      totalPayments: 0,
      averagePayment: 0,
    },
    payments: result?.payments || [],
  };
};

module.exports = {
  getPaymentReport,
};
