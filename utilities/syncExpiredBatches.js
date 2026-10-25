const mongoose = require("mongoose");
const StockBatch = require("../models/inventory/StockBatch");
const InventoryItem = require("../models/inventory/Item");

const syncExpiredBatches = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredBatches = await StockBatch.find({
    expirationDate: { $lt: today },
    remainingQuantity: { $gt: 0 },
    isExpiredProcessed: { $ne: true },
  }).select("_id");

  let processed = 0;

  for (const { _id } of expiredBatches) {
    await mongoose.connection.transaction(async (session) => {
      const batch = await StockBatch.findOne({
        _id,
        expirationDate: { $lt: today },
        remainingQuantity: { $gt: 0 },
        isExpiredProcessed: { $ne: true },
      }).session(session);

      if (!batch) return;

      const quantity = batch.remainingQuantity;

      const result = await InventoryItem.updateOne(
        { _id: batch.inventory },
        {
          $inc: {
            "stock.current": -quantity,
            "stock.expired": quantity,
          },
        },
        { session },
      );

      if (result.matchedCount !== 1) {
        throw new Error(`Inventory not found for batch ${batch._id}`);
      }

      batch.status = "expired";
      batch.isExpiredProcessed = true;

      await batch.save({ session });

      processed++;
    });
  }

  return { processed };
};

module.exports = syncExpiredBatches;
