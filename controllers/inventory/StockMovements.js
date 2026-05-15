const StockMovement = require("../../models/inventory/StockMovement");

exports.browse = async (req, res) => {
  try {
    const stockMovements = await StockMovement.find({
      inventory: req.query.inventory,
    })
      .populate("createdBy", "fullName")

      .sort({ createdAt: -1 });
    res.status(200).json({
      success: "Stock Movements Fetched Successfully",
      payload: stockMovements,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
