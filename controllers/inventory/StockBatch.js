const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");

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
      .populate("inventory", "baseUnit measurement")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: "Stock Batches Fetched Successfully",
      payload: stockBatches,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.dispose = async (req, res) => {
  try {
    const { _id, inventory, qty, user, unit } = req.body;
    const stockBatch = await StockBatch.findByIdAndUpdate(
      _id,
      { remainingQuantity: 0 },
      {
        new: true,
      },
    ).lean();

    await StockMovement.create({
      inventory,
      unit,
      stockBatch: _id,
      quantity: qty,
      remarks: "Expired batch disposed",
      type: "waste",
      source: "expired",
      createdBy: user,
    });

    res.status(200).json({
      success: "Stock Batch disposed Successfully",
      payload: _id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
