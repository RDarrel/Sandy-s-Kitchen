const Order = require("../../models/sales/order/Order");
const OrderItem = require("../../models/sales/order/OrderItem");
const dateToUTC = require("../../utilities/dateToUTC");

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
};
