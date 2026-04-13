const Audit = require("../models/Audit");
const toStartOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const toEndOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

exports.browse = async (req, res) => {
  try {
    const { from, to } = req.query;

    const start = toStartOfDayUTC(from);
    const end = toEndOfDayUTC(to);

    const audits = await Audit.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .populate("user")
      .lean();

    res.status(200).json({
      success: "Deals Fetched Successfully",
      payload: audits,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
