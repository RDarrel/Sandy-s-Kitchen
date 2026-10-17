const InventoryItem = require("../../models/inventory/Item.js");
const StockBatch = require("../../models/inventory/StockBatch.js");
const StockMovement = require("../../models/inventory/StockMovement.js");
const { convertToBaseUnit } = require("../../utilities/unitConverter.js");

const deduct = async ({
  ingredients,
  user,
  quantityKey = "qtyPerOrder",
  source,
  session,
}) => {
  try {
    const inventoryIds = ingredients.map(
      (ing) => ing?.inventory?._id || ing?.inventory,
    );

    const inventories = await InventoryItem.find({
      _id: { $in: inventoryIds },
    }).session(session);

    const inventoryMap = new Map(
      inventories.map((inv) => [String(inv._id), inv]),
    );

    const batches = await StockBatch.find({
      inventory: { $in: inventoryIds },
      remainingQuantity: { $gt: 0 },
      status: "available",
    }).session(session);

    const batchesByInventory = new Map();
    const ingrConsumedBatches = [];

    const batchUpdates = new Map();
    const inventoryUpdates = new Map();
    const stockMovements = new Map();

    for (const batch of batches) {
      const inventoryId = String(batch.inventory);

      if (!batchesByInventory.has(inventoryId)) {
        batchesByInventory.set(inventoryId, []);
      }

      batchesByInventory.get(inventoryId).push(batch);
    }

    for (const ingredient of ingredients) {
      const inventoryId = String(
        ingredient?.inventory?._id || ingredient?.inventory,
      );

      if (!inventoryId) {
        throw new Error("Invalid or missing inventory ID");
      }

      const inventory = inventoryMap.get(inventoryId);

      if (!inventory) continue;

      const inventoryBatches = batchesByInventory.get(inventoryId) || [];

      inventoryBatches.sort((a, b) => {
        if (inventory.trackExpiration) {
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        }

        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      var consumedBatches = [];
      const isPcs = inventory.measurement === "pieces";

      let qtyConverted = convertToBaseUnit({
        measurement: inventory.measurement,
        qty: ingredient[quantityKey],
        unit: ingredient.unit,
      });

      if (!Number.isFinite(qtyConverted) || qtyConverted <= 0) {
        throw new Error(`Invalid quantity for ${inventory.name}`);
      }

      if (isPcs && !Number.isInteger(qtyConverted)) {
        throw new Error(`Invalid pieces quantity for ${inventory.name}`);
      }

      let qtyToDeduct = qtyConverted;

      //START BATCHES LOOP
      for (const batch of inventoryBatches) {
        if (qtyToDeduct <= 0) {
          break;
        }
        //Skip consumed batch
        if (batch.remainingQuantity <= 0) continue;

        const deductQty = Math.min(batch.remainingQuantity, qtyToDeduct);

        inventory.stock.current -= deductQty;
        batch.remainingQuantity -= deductQty;
        qtyToDeduct -= deductQty;

        if (batch.remainingQuantity <= 0) {
          batch.status = "consumed";
        }

        if (inventory.stock.current <= 0) {
          inventory.stock.current = 0;
          inventory.status = "consumed";
        }

        batchUpdates.set(String(batch._id), {
          updateOne: {
            filter: { _id: batch._id },
            update: {
              $set: {
                remainingQuantity: batch.remainingQuantity,
                status: batch.status,
              },
            },
          },
        });

        inventoryUpdates.set(String(inventory._id), {
          updateOne: {
            filter: { _id: inventory._id },
            update: {
              $set: {
                "stock.current": inventory.stock.current,
                status: inventory.status,
              },
            },
          },
        });

        consumedBatches.push({
          consumedQty: deductQty,
          costPerUnit: batch.costPerUnit,
        });

        const batchId = String(batch._id);

        if (!stockMovements.has(batchId)) {
          stockMovements.set(batchId, {
            inventory: inventory._id,
            baseUnit: inventory.baseUnit,
            measurement: inventory.measurement,
            stockBatch: batch._id,
            quantity: 0,
            type: "out",
            source,
            createdBy: user,
          });
        }

        stockMovements.get(batchId).quantity += deductQty;
      }
      //END BATCHES LOOP

      if (qtyToDeduct > 1e-8) {
        throw new Error(`Insufficient stock for ${inventory.name}`);
      }

      if (consumedBatches?.length === 0) continue;

      const totalCost = consumedBatches.reduce((sum, batch) => {
        const cost = isPcs ? batch.costPerUnit : batch.costPerUnit / 1000;
        return sum + batch.consumedQty * cost;
      }, 0);

      const totalQty = consumedBatches.reduce(
        (sum, batch) => sum + batch.consumedQty,
        0,
      );

      const cost = totalCost / totalQty;
      const costPerUnit = isPcs ? cost : cost * 1000;

      ingrConsumedBatches.push({
        totalCost,
        inventory: ingredient._id,
        menu: ingredient?.menu,
        addOn: ingredient?.addOn,
        bundle: ingredient?.bundleId,
        costPerUnit: costPerUnit,
        consumedQty: qtyConverted,
        unit: ingredient.unit,
        isResell: ingredient.isResell,
      });

      consumedBatches = [];
    }

    if (batchUpdates.size > 0) {
      await StockBatch.bulkWrite([...batchUpdates.values()], { session });
    }

    if (inventoryUpdates.size > 0) {
      await InventoryItem.bulkWrite([...inventoryUpdates.values()], {
        session,
      });
    }

    const formattedMovements = [...stockMovements.values()].map(
      ({ measurement, baseUnit, quantity, ...movement }) => {
        const isPcs = measurement === "pieces";

        return {
          ...movement,
          unit: isPcs
            ? "pcs"
            : quantity >= 1000
              ? measurement === "weight"
                ? "kg"
                : "l"
              : baseUnit,

          quantity: isPcs
            ? quantity
            : quantity >= 1000
              ? quantity / 1000
              : quantity,
        };
      },
    );

    if (formattedMovements.length > 0) {
      await StockMovement.insertMany(formattedMovements, {
        session,
      });
    }

    return ingrConsumedBatches;
  } catch (error) {
    console.log("deduct stock error", error);
    throw error;
  }
};

module.exports = {
  deduct,
};
