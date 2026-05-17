const InventoryItem = require("../../models/inventory/Item");
const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");
const Order = require("../../models/sales/order/Order");
const OrderItem = require("../../models/sales/order/OrderItem");
const { convertToBaseUnit } = require("../../utilities/unitConverter");
const getIngredients = (items, quantity) => {
  return items.flatMap((item) => {
    const { menu, quantity, addOns } = item;
    var ingredients = [];
    if (menu?.type === "prepared") {
      ingredients = menu?.ingredients?.map((ing) => ({
        ...ing,
        qtyPerOrder: ing.qtyPerOrder * quantity,
        menu: menu._id,
      }));
    } else if (menu?.type === "bundle") {
      ingredients = menu?.bundleItems?.flatMap(
        ({
          ingredients,
          _id,
          quantity: bundleQty,
          type = "prepared",
          ...rest
        }) => {
          if (type === "resell") {
            return [
              {
                inventory: rest?.inventory,
                qtyPerOrder: quantity * bundleQty,
                unit: "pcs",
                menu: menu._id,
              },
            ];
          }
          return ingredients?.flatMap((ing) => ({
            ...ing,
            bundleId: _id,
            qtyPerOrder: quantity * bundleQty * ing.qtyPerOrder,
            menu: menu._id,
          }));
        },
      );
    } else {
      ingredients = [
        {
          inventory: menu?.inventory,
          qtyPerOrder: quantity,
          unit: "pcs",
          menu: menu._id,
        },
      ];
    }

    if (addOns?.length) {
      addOns.forEach((element) => {
        ingredients.push({
          ...element,
          addOnId: element._id,
          qtyPerOrder: element.qty * quantity,
          menu: menu._id,
        });
      });
    }

    return ingredients;
  });
};

const deductStocks = async (items, user) => {
  try {
    const ingredientsSold = getIngredients(items);

    const inventoryIds = ingredientsSold.map(
      (ing) => ing?.inventory?._id || ing?.inventory,
    );

    const inventories = await InventoryItem.find({
      _id: { $in: inventoryIds },
    });

    const inventoryMap = new Map(
      inventories.map((inv) => [String(inv._id), inv]),
    );

    const batches = await StockBatch.find({
      inventory: { $in: inventoryIds },
      remainingQuantity: { $gt: 0 },
      status: "available",
    });

    const batchesByInventory = new Map();

    const ingrConsumedBatches = [];

    for (const batch of batches) {
      const inventoryId = String(batch.inventory);

      if (!batchesByInventory.has(inventoryId)) {
        batchesByInventory.set(inventoryId, []);
      }

      batchesByInventory.get(inventoryId).push(batch);
    }

    for (const ingredient of ingredientsSold) {
      const inventoryId = String(ingredient?.inventory?._id);

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
        qty: ingredient.qtyPerOrder,
        unit: ingredient.unit,
      });
      let qtyToDeduct = qtyConverted;

      for (const batch of inventoryBatches) {
        if (qtyToDeduct <= 0) {
          break;
        }

        const deductQty = Math.min(batch.remainingQuantity, qtyToDeduct);
        inventory.stock.current -= deductQty;
        batch.remainingQuantity -= deductQty;
        qtyToDeduct -= deductQty;

        if (batch.remainingQuantity <= 0) {
          batch.status = "consumed";
          inventory.status = "consumed";
        }

        await batch.save();
        await inventory.save();

        consumedBatches.push({
          consumedQty: deductQty,
          costPerUnit: batch.costPerUnit,
        });
        await StockMovement.create({
          inventory: inventory._id,
          unit: isPcs
            ? "pcs"
            : deductQty >= 1000
              ? inventory?.measurement === "weight"
                ? "kg"
                : "l"
              : inventory?.baseUnit,
          stockBatch: batch._id,
          quantity: isPcs
            ? deductQty
            : deductQty >= 1000
              ? deductQty / 1000
              : deductQty,
          type: "out",
          source: "order",
          createdBy: user,
        });
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
        recipe: ingredient._id,
        menu: ingredient?.menu,
        addOn: ingredient?.addOnId,
        bundle: ingredient?.bundleId,
        costPerUnit: costPerUnit,
        consumedQty: qtyConverted,
        unit: ingredient.unit,
      });
      consumedBatches = [];
    }

    return ingrConsumedBatches;
  } catch (error) {
    console.log("deduct stock error", error);
    throw error;
  }
};
const formattedBreakdown = (menuId, items = [], consumedBatches = [], key) => {
  return items
    .map((item) => {
      const consumed = consumedBatches.find(
        (batch) =>
          String(batch[key]) === String(item._id) && batch.menu === menuId,
      );

      if (!consumed) return null;

      return {
        ...consumed,
        price: item.price,
      };
    })
    .filter(Boolean);
};
const handleItems = async (itemsRaw, user, orderId) => {
  try {
    const items = [];
    const consumedBatches = await deductStocks(itemsRaw, user);

    itemsRaw.forEach((item) => {
      const { menu, addOns = [] } = item;
      let formattedAddOns = [];
      let bundleItems = [];
      let recipes = [];
      if (addOns?.length > 0) {
        formattedAddOns = formattedBreakdown(
          menu?._id,
          addOns,
          consumedBatches,
          "addOn",
        );
      }
      if (menu?.bundleItems?.length > 0 && menu?.type === "bundle") {
        menu.bundleItems.forEach((bundleItem) => {
          const consumed = consumedBatches.filter(
            (batch) =>
              String(batch.bundle) === String(bundleItem._id) &&
              batch.menu === menu?._id,
          );
          bundleItems.push({
            recipes: consumed,
            bundle: bundleItem?._id,
            price: bundleItem.price,
            amount: bundleItem.quantity * item?.quantity * bundleItem.price,
            quantity: bundleItem.qtyPerOrder,
            totalCost: consumed.reduce(
              (sum, batch) => sum + batch.totalCost,
              0,
            ),
          });
        });
      }

      if (menu?.type === "prepared" || menu?.type === "resell") {
        recipes = formattedBreakdown(
          menu?._id,
          menu?.ingredients,
          consumedBatches,
          "recipe",
        );
      }
      const breakdownRaw = {
        addOns: formattedAddOns,
        bundleItems,
        recipes,
      };
      const breakdown = Object.fromEntries(
        Object.entries(breakdownRaw).filter(([_, value]) => value?.length > 0),
      );
      const totalCost =
        breakdownRaw.recipes.reduce((sum, batch) => sum + batch.totalCost, 0) +
        breakdownRaw.addOns.reduce((sum, batch) => sum + batch.totalCost, 0) +
        breakdownRaw.bundleItems.reduce((sum, item) => sum + item.totalCost, 0);

      items.push({
        order: orderId,
        menu: menu._id,
        quantity: item.quantity,
        amount: menu?.price * item.quantity,
        price: menu?.price,
        breakdown,
        totalCost,
      });
    });

    await OrderItem.insertMany(items);
  } catch (error) {
    console.log("handle items error", error);
  }
};
exports.save = async (req, res) => {
  try {
    const { items, order } = req.body;
    const createdOrder = await Order.create(order);
    await handleItems(items, order.created.by, createdOrder._id);

    res.status(201).json({
      success: "Order Created Successfully",
      payload: createdOrder,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
