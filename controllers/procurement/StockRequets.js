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
