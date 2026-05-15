const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");
const InventoryItem = require("../../models/inventory/Item");
const { convertToBaseUnit } = require("../../utilities/unitConverter");

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

exports.reportWaste = async (req, res) => {
  try {
    const {
      qty,
      trackExpiration = false,
      unit,
      user,
      inventory,
      source,
      remarks,
      measurement,
    } = req.body;
    var reportWaste = convertToBaseUnit({
      measurement,
      qty,
      unit,
    });
    const sortOption = trackExpiration
      ? { expirationDate: 1, createdAt: 1 }
      : { createdAt: 1 };

    const batches = await StockBatch.find({
      inventory: item._id,
      remainingQuantity: { $gt: 0 },
      status: "available",
    }).sort(sortOption);

    const movementBatches = [];

    for (const batch of batches) {
      if (qtyToDeduct <= 0) break;

      const deductQty = Math.min(batch.remainingQuantity, qtyToDeduct);

      batch.remainingQuantity -= deductQty;
      qtyToDeduct -= deductQty;

      if (batch.remainingQuantity === 0) {
        batch.status = "consumed";
      }

      await batch.save();
      movementBatches.push({ quantity: deductQty, batch: batch._id });
    }
    const updatedInventory = await InventoryItem.findByIdAndUpdate(
      inventory,
      {
        $inc: {
          "stock.current": -reportWaste,
        },
      },
      {
        new: true,
      },
    );
    await StockMovement.create({
      inventory,
      unit,
      quantity: reportWaste,
      remarks: remarks || "",
      type: "waste",
      source: source,
      createdBy: user,
      batches: movementBatches,
    });

    res.status(200).json({
      success: "Stock Batch disposed Successfully",
      payload: updatedInventory,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
