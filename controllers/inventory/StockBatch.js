const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");
const InventoryItem = require("../../models/inventory/Item");
const mongoose = require("mongoose");
const {
  convertToBaseUnit,
  convertFromBaseUnit,
} = require("../../utilities/unitConverter");

const unitMap = {
  g: "kg",
  ml: "l",
  pcs: "pcs",
};

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);
    const sortOption = trackExpiration
      ? { expirationDate: 1, createdAt: 1 }
      : { createdAt: 1 };

    const batches = await StockBatch.find({
      inventory,
      remainingQuantity: { $gt: 0 },
      status: "available",
    }).sort(sortOption);

    const movementBatches = [];
    let qtyToDeduct = reportWaste;

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
      quantity: qty,
      remarks: remarks || "",
      type: "waste",
      source: source,
      createdBy: user,
      batches: movementBatches,
    });

    const expiringSoonStocks = await StockBatch.aggregate([
      {
        $match: {
          inventory: new mongoose.Types.ObjectId(inventory),
          remainingQuantity: { $gt: 0 },
          expirationDate: {
            $gte: today,
            $lte: next7Days,
          },
        },
      },
      {
        $group: {
          _id: "$inventory",
          total: { $sum: "$remainingQuantity" },
        },
      },
    ]);
    const expiringSoonQty = expiringSoonStocks[0]?.total || 0;
    res.status(200).json({
      success: "Report Wasted Successfully",
      payload: {
        _id: inventory,
        expiringSoon: {
          value: expiringSoonQty,
          display: convertFromBaseUnit({
            measurement,
            qty: expiringSoonQty,
            unit: unitMap[updatedInventory.baseUnit],
          }),
        },
        stock: updatedInventory.stock,
        stockDisplay: updatedInventory.stockDisplay,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
