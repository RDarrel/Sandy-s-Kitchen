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

  const dateFilter = {
    createdAt: {
      $gte: start,
      $lte: end,
    },
  };

  const [orderResult, itemResult] = await Promise.all([
    Order.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]),

    OrderItem.aggregate([
      {
        $match: dateFilter,
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalCost: { $sum: "$totalCost" },
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
    ]),
  ]);

  const totalSales = orderResult?.[0]?.totalSales || 0;
  const totalOrders = orderResult?.[0]?.totalOrders || 0;
  const totalCost = itemResult?.[0]?.summary?.[0]?.totalCost || 0;

  return {
    summary: {
      totalSales,
      totalCost,
      grossProfit: totalSales - totalCost,
      totalOrders,
    },
    salesBreakdown: itemResult?.[0]?.salesBreakdown || [],
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
  await Order.populate(transactions, [
    {
      path: "method",
      select: "name type",
      model: "PaymentMethod",
    },
  ]);
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

const getAnalytics = async ({ startDate, endDate }) => {
  const start = dateToUTC({ date: startDate, dateOnly: true });
  const end = dateToUTC({ date: endDate, dateOnly: true, endOfDay: true });

  if (!start || !end || start > end) {
    const error = new Error("A valid startDate and endDate are required.");
    error.status = 400;
    throw error;
  }

  const [result] = await OrderItem.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalOrders: { $addToSet: "$order" },
              totalSales: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalOrders: { $size: "$totalOrders" },
              totalSales: 1,
              averageOrderValue: {
                $cond: [
                  { $gt: [{ $size: "$totalOrders" }, 0] },
                  {
                    $divide: ["$totalSales", { $size: "$totalOrders" }],
                  },
                  0,
                ],
              },
            },
          },
        ],

        trends: [
          {
            $group: {
              _id: {
                $dateTrunc: {
                  date: "$createdAt",
                  unit: "month",
                  timezone: "Asia/Manila",
                },
              },
              orders: { $addToSet: "$order" },
              value: { $sum: "$amount" },
            },
          },
          {
            $sort: { _id: 1 },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              orders: { $size: "$orders" },
              value: 1,
            },
          },
        ],

        dishes: [
          {
            $group: {
              _id: "$menu",
              unitsSold: { $sum: "$quantity" },
              value: { $sum: "$amount" },
            },
          },
          {
            $sort: {
              unitsSold: -1,
              value: -1,
              _id: 1,
            },
          },
          {
            $limit: 5,
          },
          {
            $lookup: {
              from: "menus",
              localField: "_id",
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
            $project: {
              _id: 1,
              name: {
                $ifNull: ["$menu.name", "Unknown dish"],
              },
              unitsSold: 1,
              value: 1,
            },
          },
        ],

        categories: [
          {
            $lookup: {
              from: "menus",
              localField: "menu",
              foreignField: "_id",
              as: "menu",
            },
          },
          {
            $unwind: "$menu",
          },
          {
            $group: {
              _id: "$menu.category",
              unitsSold: { $sum: "$quantity" },
              value: { $sum: "$amount" },
            },
          },
          {
            $sort: {
              value: -1,
              unitsSold: -1,
              _id: 1,
            },
          },
          {
            $lookup: {
              from: "menucategories",
              localField: "_id",
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
          {
            $project: {
              _id: 1,
              name: {
                $ifNull: ["$category.name", "Uncategorized"],
              },
              unitsSold: 1,
              value: 1,
            },
          },
        ],
      },
    },
  ]);

  const summary = result?.summary?.[0] || {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };

  const dishes = (result?.dishes || []).map((dish) => ({
    ...dish,
    percentage: summary.totalSales
      ? (dish.value / summary.totalSales) * 100
      : 0,
  }));

  const categories = (result?.categories || []).map((category) => ({
    ...category,
    percentage: summary.totalSales
      ? (category.value / summary.totalSales) * 100
      : 0,
  }));

  const bestSellingDish = dishes[0]
    ? {
        _id: dishes[0]._id,
        name: dishes[0].name,
        unitsSold: dishes[0].unitsSold,
      }
    : null;

  return {
    analytics: {
      summary: {
        totalSales: summary.totalSales,
        totalOrders: summary.totalOrders,
        bestSellingDish,
        averageOrderValue: summary.averageOrderValue,
      },
      trends: result?.trends || [],
      dishes,
      categories,
    },
  };
};

module.exports = {
  getTransactionsReport,
  getSalesReport,
  getAnalytics,
};
