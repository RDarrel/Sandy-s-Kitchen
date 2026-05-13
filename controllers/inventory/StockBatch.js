const StockBatch = require("../../models/inventory/StockBatch");

exports.browse = async (req, res) => {
  try {
    const stockBatches = await StockBatch.find({
      deletedAt: { $exists: false },
      inventory: req.query.inventory,
      remainingQuantity: { $gt: 0 },
    })
      .populate({
        path: "purchase",
        select: "supplier received",
        populate: { path: "supplier", select: "name" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Stock Batches Fetched Successfully",
      payload: stockBatches,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
