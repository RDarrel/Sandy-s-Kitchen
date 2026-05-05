const StockRequest = require("../../models/procurement/StockRequest");
exports.save = async (req, res) => {
  try {
    await StockRequest.create(req.body);
    res.status(201).json({
      success: "Request Created Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const stockRequests = await StockRequest.find({
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Stock Requests Fetched Successfully",
      payload: stockRequests,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
