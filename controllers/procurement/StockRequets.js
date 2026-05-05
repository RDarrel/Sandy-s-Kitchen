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
      status: req.query.status,
      deletedAt: { $exists: false },
    })
      .populate("requestedBy", "fullName")
      .populate({
        path: "items.inventory",
        populate: {
          path: "suppliers.supplier", // depende sa schema mo
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: "Stock Requests Fetched Successfully",
      payload: stockRequests,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
