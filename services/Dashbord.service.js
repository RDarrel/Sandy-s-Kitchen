const BookingPayment = require("../models/events/Payment");
const Booking = require("../models/events/Booking");
const Order = require("../models/sales/order/Order");
const OrderItem = require("../models/sales/order/OrderItem");
const Inventory = require("../models/inventory/Item");
const Purchase = require("../models/procurement/Purchase");
const Supplier = require("../models/procurement/Supplier");
const dateToUTC = require("../utilities/dateToUTC");
const TIMEZONE = "Asia/Manila";

const getIncomingDeliveries = async ({ limit = 5 } = {}) => {
  const itemLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);

  const result = await Purchase.aggregate([
    {
      $match: {
        deletedAt: null,
        status: {
          $in: ["incoming", "redelivery"],
        },
      },
    },
    {
      $facet: {
        deliveries: [
          {
            $sort: {
              "deliveryWindow.from": 1,
              _id: 1,
            },
          },
          {
            $limit: itemLimit,
          },
          {
            $lookup: {
              from: Supplier.collection.name,
              localField: "supplier",
              foreignField: "_id",
              as: "supplierDetails",
            },
          },
          {
            $unwind: {
              path: "$supplierDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              supplier: {
                _id: "$supplier",
                name: {
                  $ifNull: ["$supplierDetails.name", "Unknown Supplier"],
                },
              },
              totalAmount: 1,
              status: 1,
              deliveryWindow: 1,
              hasShortDelivery: 1,
              shortItemQty: 1,
              originalPurchase: 1,
              parentPurchase: 1,
            },
          },
        ],

        totalIncoming: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const data = result[0] ?? {};

  return {
    deliveries: data.deliveries ?? [],
    totalIncoming: data.totalIncoming?.[0]?.count ?? 0,
  };
};

const getInventoryOverview = async ({ limit = 5 } = {}) => {
  const itemLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);

  const result = await Inventory.aggregate([
    // Exclude soft-deleted items
    {
      $match: {
        deletedAt: null,
      },
    },

    // Current stock is stored in g/ml; the reorder level is stored in kg/L.
    {
      $addFields: {
        minimumStockInBase: {
          $multiply: [
            { $ifNull: ["$stock.min", 0] },
            {
              $cond: [{ $in: ["$measurement", ["weight", "volume"]] }, 1000, 1],
            },
          ],
        },
      },
    },

    // Calculate stock status
    {
      $addFields: {
        stockStatus: {
          $switch: {
            branches: [
              {
                case: {
                  $lte: ["$stock.current", 0],
                },
                then: "Out of Stock",
              },
              {
                case: {
                  $lt: ["$stock.current", "$minimumStockInBase"],
                },
                then: "Low Stock",
              },
            ],
            default: "In Stock",
          },
        },
      },
    },

    // Only items requiring replenishment
    {
      $match: {
        stockStatus: {
          $in: ["Out of Stock", "Low Stock"],
        },
      },
    },

    // Get items and counts in one aggregation
    {
      $facet: {
        items: [
          {
            $addFields: {
              priority: {
                $cond: [
                  {
                    $eq: ["$stockStatus", "Out of Stock"],
                  },
                  0,
                  1,
                ],
              },
            },
          },
          {
            $sort: {
              priority: 1,
              "stock.current": 1,
              name: 1,
            },
          },
          {
            $limit: itemLimit,
          },
          {
            $project: {
              _id: 1,
              name: 1,
              type: 1,
              category: 1,
              measurement: 1,
              baseUnit: 1,
              stockStatus: 1,
              currentStock: "$stock.current",
              minimumStock: "$stock.min",
              stockPercentage: {
                $cond: [
                  {
                    $gt: ["$minimumStockInBase", 0],
                  },
                  {
                    $multiply: [
                      {
                        $divide: ["$stock.current", "$minimumStockInBase"],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ],

        statusCounts: [
          {
            $group: {
              _id: "$stockStatus",
              count: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
  ]);

  const data = result[0] ?? {};

  const statusCounts = {
    lowStock: 0,
    outOfStock: 0,
  };

  for (const item of data.statusCounts ?? []) {
    if (item._id === "Low Stock") {
      statusCounts.lowStock = item.count;
    }

    if (item._id === "Out of Stock") {
      statusCounts.outOfStock = item.count;
    }
  }

  return {
    items: data.items ?? [],
    statusCounts,
    totalNeedsReplenishment: statusCounts.lowStock + statusCounts.outOfStock,
  };
};

const getUpcomingBookings = async ({ limit = 5 } = {}) => {
  const now = new Date();

  const itemLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);

  const result = await Booking.aggregate([
    {
      $match: {
        status: {
          $in: ["approved", "confirmed", "setup"],
        },
      },
    },

    // Find the nearest future schedule
    {
      $addFields: {
        upcomingDate: {
          $min: {
            $filter: {
              input: ["$catering.schedule.startAt", "$venue.schedule.startAt"],
              as: "schedule",
              cond: {
                $and: [
                  { $ne: ["$$schedule", null] },
                  { $gte: ["$$schedule", now] },
                ],
              },
            },
          },
        },
      },
    },

    // Include only bookings with upcoming schedules
    {
      $match: {
        upcomingDate: {
          $type: "date",
        },
      },
    },

    // Get bookings, status counts, and total
    {
      $facet: {
        bookings: [
          {
            $sort: {
              upcomingDate: 1,
              _id: 1,
            },
          },
          {
            $limit: itemLimit,
          },
          {
            $project: {
              _id: 1,
              status: 1,
              reference: 1,
              eventType: 1,
              bookingType: 1,
              guests: {
                $cond: [
                  { $in: ["$bookingType", ["both", "venue"]] },
                  "$venue.pax",
                  "$catering.pax",
                ],
              },
              cateringSchedule: "$catering.schedule",
              venueSchedule: "$venue.schedule",
              upcomingDate: 1,
            },
          },
        ],

        statusCounts: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],

        totalBookings: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const data = result[0] ?? {};

  const statusCounts = {
    approved: 0,
    setup: 0,
  };

  for (const item of data.statusCounts ?? []) {
    statusCounts[item._id] = item.count;
  }

  return {
    bookings: data.bookings ?? [],
    statusCounts,
    totalBookings: data.totalBookings?.[0]?.count ?? 0,
  };
};

const getTopSellingItems = async ({ startDate, endDate, limit = 5 }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const itemLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);

  const result = await OrderItem.aggregate([
    // Join the parent POS order
    {
      $lookup: {
        from: Order.collection.name,
        localField: "order",
        foreignField: "_id",
        as: "orderDetails",
      },
    },
    {
      $unwind: "$orderDetails",
    },

    // Filter by order date
    {
      $match: {
        "orderDetails.createdAt": {
          $gte: start,
          $lte: end,
        },

        // Add your actual paid/completed order
        // status filter here.
      },
    },

    // Group by menu item
    {
      $group: {
        _id: "$menu",
        quantitySold: {
          $sum: "$quantity",
        },
        totalSales: {
          $sum: "$amount",
        },
      },
    },

    // Highest quantity first
    {
      $sort: {
        quantitySold: -1,
        totalSales: -1,
        _id: 1,
      },
    },

    // Return only the top items
    {
      $limit: itemLimit,
    },

    // Get menu details
    {
      $lookup: {
        from: "menus",
        localField: "_id",
        foreignField: "_id",
        as: "menuDetails",
      },
    },
    {
      $unwind: {
        path: "$menuDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Final response shape
    {
      $project: {
        _id: 0,
        menuId: "$_id",
        name: {
          $ifNull: ["$menuDetails.name", "Unknown Item"],
        },
        quantitySold: 1,
        totalSales: 1,
      },
    },
  ]);

  return result;
};

const getCollections = async ({ startDate, endDate, frequency = "daily" }) => {
  const frequencyMap = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required.");
  }

  if (!Object.hasOwn(frequencyMap, frequency)) {
    throw new Error("Invalid frequency.");
  }

  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const dateGroup = (field) => ({
    $dateTrunc: {
      date: field,
      unit: frequencyMap[frequency],
      timezone: TIMEZONE,
      ...(frequency === "weekly" && {
        startOfWeek: "monday",
      }),
    },
  });

  const [orderResult, paymentResult] = await Promise.all([
    // POS Collections
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },

          // Add your actual paid/completed status
          // filter if your Order model needs it.
        },
      },
      {
        $group: {
          _id: dateGroup("$createdAt"),
          totalAmount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),

    // Booking Collections
    BookingPayment.aggregate([
      {
        $match: {
          reviewedAt: {
            $gte: start,
            $lte: end,
          },
          status: "verified",
        },
      },
      {
        $group: {
          _id: dateGroup("$reviewedAt"),
          totalAmount: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]),
  ]);

  // Combine POS and Booking collections by period
  const collectionsMap = new Map();

  for (const item of orderResult) {
    const key = item._id.toISOString();

    collectionsMap.set(key, {
      period: key,
      booking: 0,
      pos: item.totalAmount,
    });
  }

  for (const item of paymentResult) {
    const key = item._id.toISOString();

    if (!collectionsMap.has(key)) {
      collectionsMap.set(key, {
        period: key,
        booking: 0,
        pos: 0,
      });
    }

    collectionsMap.get(key).booking += item.totalAmount;
  }

  const overview = [...collectionsMap.values()].sort(
    (a, b) => new Date(a.period) - new Date(b.period),
  );

  // Calculate totals for the Pie Chart
  const totals = overview.reduce(
    (acc, item) => {
      acc.booking += item.booking;
      acc.pos += item.pos;

      return acc;
    },
    {
      booking: 0,
      pos: 0,
    },
  );

  return {
    overview,
    bySource: [
      {
        name: "booking",
        value: totals.booking,
      },
      {
        name: "pos",
        value: totals.pos,
      },
    ],
    totalCollections: totals.booking + totals.pos,
  };
};

const getTrendFrequency = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  const days = Math.round((end - start) / 86400000) + 1;

  if (days <= 1) return "hour";
  if (days <= 31) return "day";
  if (days <= 366) return "month";

  return "year";
};

const getSummary = async ({ startDate, endDate }) => {
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required.");
  }

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
    !(start instanceof Date) ||
    !(end instanceof Date) ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start > end
  ) {
    throw new Error("Invalid date range.");
  }

  const trendFrequency = getTrendFrequency(startDate, endDate);

  const dateGroup = (field) => ({
    $dateTrunc: {
      date: field,
      unit: trendFrequency,
      timezone: TIMEZONE,
    },
  });

  const [orderResult, paymentResult, outstandingResult] = await Promise.all([
    // 1. POS collections and trends
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },

          // Add your actual paid/completed status
          // filter if necessary.
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalAmount: {
                  $sum: {
                    $ifNull: ["$amount", 0],
                  },
                },
                transactions: { $sum: 1 },
              },
            },
          ],

          trends: [
            {
              $group: {
                _id: dateGroup("$createdAt"),
                amount: {
                  $sum: {
                    $ifNull: ["$amount", 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),

    // 2. Booking collections and trends
    BookingPayment.aggregate([
      {
        $match: {
          reviewedAt: {
            $gte: start,
            $lte: end,
          },
          status: "verified",
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalAmount: {
                  $sum: {
                    $ifNull: ["$amount", 0],
                  },
                },
                verifiedPayments: { $sum: 1 },
              },
            },
          ],

          trends: [
            {
              $group: {
                _id: dateGroup("$reviewedAt"),
                amount: {
                  $sum: {
                    $ifNull: ["$amount", 0],
                  },
                },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),

    // 3. Current outstanding balance
    Booking.aggregate([
      {
        $match: {
          status: {
            $in: ["confirmed", "setup", "completed"],
          },
        },
      },
      {
        $lookup: {
          from: BookingPayment.collection.name,
          let: {
            bookingId: "$_id",
          },
          pipeline: [
            {
              $match: {
                status: "verified",
                $expr: {
                  $eq: ["$booking", "$$bookingId"],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalPaid: {
                  $sum: {
                    $ifNull: ["$amount", 0],
                  },
                },
              },
            },
          ],
          as: "payments",
        },
      },
      {
        $set: {
          totalPaid: {
            $ifNull: [
              {
                $arrayElemAt: ["$payments.totalPaid", 0],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          remainingBalance: {
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
      {
        $group: {
          _id: null,
          outstandingBalance: {
            $sum: "$remainingBalance",
          },
          bookingsWithBalance: {
            $sum: {
              $cond: [
                {
                  $gt: ["$remainingBalance", 0],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const orderData = orderResult[0] ?? {};
  const paymentData = paymentResult[0] ?? {};

  const posSales = orderData.summary?.[0]?.totalAmount ?? 0;

  const bookingCollections = paymentData.summary?.[0]?.totalAmount ?? 0;

  const outstandingBalance = outstandingResult[0]?.outstandingBalance ?? 0;

  // Merge Booking and POS trends
  const trendsMap = new Map();

  for (const item of orderData.trends ?? []) {
    const key = item._id.toISOString();

    trendsMap.set(key, {
      date: key,
      booking: 0,
      pos: item.amount,
      total: item.amount,
    });
  }

  for (const item of paymentData.trends ?? []) {
    const key = item._id.toISOString();

    if (!trendsMap.has(key)) {
      trendsMap.set(key, {
        date: key,
        booking: 0,
        pos: 0,
        total: 0,
      });
    }

    const trend = trendsMap.get(key);

    trend.booking += item.amount;
    trend.total += item.amount;
  }

  // Fill missing periods with zero values
  const trends = [];

  const cursor = new Date(start);

  // Align cursor with MongoDB dateTrunc boundaries.
  // Philippine time is UTC+8, with no DST.
  const PH_OFFSET = 8 * 60 * 60 * 1000;

  const alignDate = (date) => {
    const local = new Date(date.getTime() + PH_OFFSET);

    if (trendFrequency === "year") {
      local.setUTCMonth(0, 1);
      local.setUTCHours(0, 0, 0, 0);
    } else if (trendFrequency === "month") {
      local.setUTCDate(1);
      local.setUTCHours(0, 0, 0, 0);
    } else if (trendFrequency === "day") {
      local.setUTCHours(0, 0, 0, 0);
    } else {
      local.setUTCMinutes(0, 0, 0);
    }

    return new Date(local.getTime() - PH_OFFSET);
  };

  let period = alignDate(cursor);

  while (period <= end) {
    const key = period.toISOString();

    trends.push(
      trendsMap.get(key) ?? {
        date: key,
        booking: 0,
        pos: 0,
        total: 0,
      },
    );

    // Move to the next calendar period in PH time
    const local = new Date(period.getTime() + PH_OFFSET);

    if (trendFrequency === "hour") {
      local.setUTCHours(local.getUTCHours() + 1);
    } else if (trendFrequency === "day") {
      local.setUTCDate(local.getUTCDate() + 1);
    } else if (trendFrequency === "month") {
      local.setUTCMonth(local.getUTCMonth() + 1);
    } else {
      local.setUTCFullYear(local.getUTCFullYear() + 1);
    }

    period = new Date(local.getTime() - PH_OFFSET);
  }

  return {
    totalCollections: bookingCollections + posSales,
    bookingCollections,
    posSales,
    outstandingBalance,
    verifiedPayments: paymentData.summary?.[0]?.verifiedPayments ?? 0,
    posTransactions: orderData.summary?.[0]?.transactions ?? 0,
    bookingsWithBalance: outstandingResult[0]?.bookingsWithBalance ?? 0,
    trends,
  };
};

module.exports = {
  getSummary,
  getCollections,
  getTopSellingItems,
  getUpcomingBookings,
  getInventoryOverview,
  getIncomingDeliveries,
};
