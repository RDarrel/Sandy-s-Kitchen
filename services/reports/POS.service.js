const Order = require("../../models/sales/order/Order");
const OrderItem = require("../../models/sales/order/OrderItem");
const dateToUTC = require("../../utilities/dateToUTC");

const getSalesReport = async ({ startDate, endDate, frequency = "daily" }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const frequencyMap = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  const unit = frequencyMap[frequency] || "day";

  const [result] = await OrderItem.aggregate([
    {
      $match: {
        createdAt: {
          $gte: start,
          $lte: end,
        },
      },
    },

    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$amount" },
              totalCost: { $sum: "$totalCost" },
              totalOrders: { $addToSet: "$order" },
            },
          },
          {
            $project: {
              _id: 0,
              totalSales: 1,
              totalCost: 1,
              grossProfit: {
                $subtract: ["$totalSales", "$totalCost"],
              },
              totalOrders: {
                $size: "$totalOrders",
              },
            },
          },
        ],

        salesBreakdown: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "menus",
              localField: "menu",
              foreignField: "_id",
              as: "menu",
            },
          },
          {
            $unwind: {
              path: "$menu",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: "$createdAt",
                  unit,
                  timezone: "Asia/Manila",
                  startOfWeek: "monday",
                },
              },

              items: {
                $push: {
                  _id: "$_id",
                  order: "$order",
                  menu: {
                    _id: "$menu._id",
                    name: "$menu.name",
                  },
                  quantity: "$quantity",
                  price: "$price",
                  amount: "$amount",
                  totalCost: "$totalCost",
                  createdAt: "$createdAt",
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              items: 1,
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
        ],
      },
    },
  ]);

  return {
    summary: result?.summary?.[0] || {
      totalSales: 0,
      totalCost: 0,
      grossProfit: 0,
      totalOrders: 0,
    },
    salesBreakdown: result?.salesBreakdown || [],
  };
};

const getTransactionsReport = async ({ startDate, endDate }) => {
  const start = dateToUTC({ date: startDate, dateOnly: true });
  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const [result] = await Order.aggregate([
    {
      $match: {
        ...(start &&
          end && {
            createdAt: {
              $gte: start,
              $lte: end,
            },
          }),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "created.by",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              fullName: 1,
            },
          },
        ],
        as: "_cashier",
      },
    },
    {
      $set: {
        "created.by": {
          $arrayElemAt: ["$_cashier", 0],
        },
      },
    },
    {
      $unset: "_cashier",
    },
    {
      $facet: {
        transactions: [
          {
            $sort: {
              createdAt: -1,
              _id: -1,
            },
          },
          {
            $lookup: {
              from: OrderItem.collection.name,
              localField: "_id",
              foreignField: "order",
              as: "items",
            },
          },
        ],
        cashiers: [
          {
            $match: {
              "created.by._id": { $ne: null },
            },
          },
          {
            $group: {
              _id: "$created.by._id",
              fullName: {
                $first: "$created.by.fullName",
              },
            },
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
            },
          },
          {
            $sort: {
              fullName: 1,
            },
          },
        ],
        totalAmount: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
        total: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const transactions = result?.transactions || [];
  const items = transactions.flatMap((transaction) => transaction.items || []);

  await OrderItem.populate(items, [
    {
      path: "menu",
      select: "name type",
    },
    {
      path: "breakdown.addOns.addOn",
      select: "name",
    },
    {
      path: "breakdown.bundleItems.bundle",
      select: "name",
    },
  ]);

  return {
    transactions,
    cashiers: result?.cashiers || [],
    totalAmount: result?.totalAmount?.[0]?.totalAmount || 0,
    totalCount: result?.total?.[0]?.count || 0,
  };
};

module.exports = {
  getTransactionsReport,
  getSalesReport,
};
