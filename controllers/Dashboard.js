const Solds = require("../models/commerce/Sold");
const Deals = require("../models/commerce/Deals");

const getMonth = (month) => {
  const now = new Date(`${month}-01T00:00:00`);

  // start of month
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  // end of month
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  );

  return {
    startOfMonth,
    endOfMonth,
    startOfLastMonth,
    endOfLastMonth,
  };
};
exports.sales = async (req, res) => {
  try {
    const { startOfMonth, endOfMonth, startOfLastMonth, endOfLastMonth } =
      getMonth(req.query.month);

    const salesData = await Solds.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: "fuels", // collection name (plural dapat)
          localField: "fuel",
          foreignField: "_id",
          as: "fuelInfo",
        },
      },
      { $unwind: "$fuelInfo" },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            fuel: "$fuelInfo.name",
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          sales: {
            $push: { k: "$_id.fuel", v: "$totalAmount" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          sales: { $arrayToObject: "$sales" },
        },
      },
      {
        $addFields: {
          total: {
            $sum: {
              $map: {
                input: { $objectToArray: "$sales" },
                as: "s",
                in: "$$s.v",
              },
            },
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    const lastMonthTotalResult = await Solds.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
        },
      },
    ]);

    const lastMonthTotal = lastMonthTotalResult.length
      ? lastMonthTotalResult[0].total
      : 0;

    res.json({
      payload: { datas: salesData, lastMonthTotal },
      success: "Sales Fetched Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales data" });
  }
};

exports.topProducts = async (req, res) => {
  const { startOfMonth, endOfMonth, startOfLastMonth, endOfLastMonth } =
    getMonth(req.query.month);
  try {
    // Define colors for pie chart
    const fuelColors = {
      Unleaded: "#FFF0D6",
      Premium: "#FF4F00",
      Diesel: "#F5F2ED",
    };

    // --- Current Month Liters per Fuel ---
    const currentMonthLiters = await Solds.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          deletedAt: { $exists: false },
        },
      },
      {
        $lookup: {
          from: "fuels",
          localField: "fuel",
          foreignField: "_id",
          as: "fuelInfo",
        },
      },
      { $unwind: "$fuelInfo" },
      {
        $group: {
          _id: "$fuelInfo.name",
          liters: { $sum: { $divide: ["$amount", "$srp"] } },
        },
      },
    ]);

    const chartDataPie = currentMonthLiters.map((item) => ({
      fuel: item._id,
      liters: item.liters,
      fill: fuelColors[item._id] || "#ccc",
    }));

    // --- Last Month Overall Liters ---
    const lastMonthLitersData = await Solds.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: { $divide: ["$amount", "$srp"] } },
        },
      },
    ]);

    const lastMonthTotalLiters = lastMonthLitersData.length
      ? lastMonthLitersData[0].totalLiters
      : 0;

    res.json({
      payload: {
        products: chartDataPie, // per fuel, current month
        lastMonthTotalLiters, // total liters last month
      },
      success: "Sales Liters Fetched Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales liters data" });
  }
};

exports.transactions = async (req, res) => {
  const { startOfMonth, endOfMonth, startOfLastMonth, endOfLastMonth } =
    getMonth(req.query.month);
  try {
    // Current month transaction count
    const thisMonthCount = await Deals.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      deletedAt: null,
    });

    // Last month transaction count
    const lastMonthCount = await Deals.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      deletedAt: null,
    });

    res.json({
      payload: [
        { title: "Current", total: thisMonthCount || 0 },
        { title: "Last Month", total: lastMonthCount || 0 },
      ],

      success: "Transactions Count Fetched Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions count" });
  }
};

exports.liters = async (req, res) => {
  try {
    let { start, end } = req.query; // o req.query kung GET

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and End dates are required" });
    }

    // parse dates from frontend input
    const startOfRange = new Date(start);
    const endOfRange = new Date(end);

    // force 00:00:00 sa start
    startOfRange.setHours(0, 0, 0, 0);
    // force 23:59:59 sa end
    endOfRange.setHours(23, 59, 59, 999);

    // Aggregation (compute liters per day)
    const litersData = await Solds.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfRange, $lte: endOfRange },
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          totalLiters: {
            $sum: {
              $cond: [
                { $gt: ["$srp", 0] },
                { $divide: ["$amount", "$srp"] },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          Liters: { $round: ["$totalLiters", 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Fill missing days with zero
    const result = [];
    const current = new Date(startOfRange);

    while (current <= endOfRange) {
      const dateStr = current.toISOString().split("T")[0];
      const dayData = litersData.find((d) => d.date === dateStr);

      result.push({
        date: dateStr,
        Liters: dayData ? dayData.Liters : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    res.json({
      payload: result,
      success: "Liters Fetched Successfully",
    });
  } catch (err) {
    console.error("Liters error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
