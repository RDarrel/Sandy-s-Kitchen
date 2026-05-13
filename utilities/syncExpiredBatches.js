const StockBatch = require("../models/inventory/StockBatch");
const InventoryItem = require("../models/inventory/Item");

const syncExpiredBatches = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredBatches = await StockBatch.find({
      expirationDate: { $lt: today },
      remainingQuantity: { $gt: 0 },
      $or: [
        { isExpiredProcessed: false },
        { isExpiredProcessed: { $exists: false } },
      ],
    });

    for (const batch of expiredBatches) {
      await InventoryItem.updateOne(
        { _id: batch.inventory },
        {
          $inc: {
            "stock.current": -batch.remainingQuantity,
            "stock.expired": batch.remainingQuantity,
          },
        },
      );

      batch.status = "expired";
      batch.isExpiredProcessed = true;

      await batch.save();
    }
  } catch (error) {
    console.error("Expiration job error:", error);
  }
};

module.exports = syncExpiredBatches;
