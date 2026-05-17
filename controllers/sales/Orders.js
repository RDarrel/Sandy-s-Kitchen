const InventoryItem = require("../../models/inventory/Item");
const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");
const Order = require("../../models/sales/order/Order");
const OrderItem = require("../../models/sales/order/OrderItem");
const { convertToBaseUnit } = require("../../utilities/unitConverter");
const getIngredients = (items) => {
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
                isResell: true,
                bundleId: _id,
              },
            ];
          } else {
            return ingredients?.flatMap((ing) => ({
              ...ing,
              bundleId: _id,
              qtyPerOrder: quantity * bundleQty * ing.qtyPerOrder,
              menu: menu._id,
            }));
          }
        },
      );
    } else {
      ingredients = [
        {
          isResell: true,
          inventory: menu?.inventory,
          qtyPerOrder: quantity,
          unit: "pcs",
          menu: menu._id,
        },
      ];
    }

    const addOnsWithRecipes = addOns?.filter(({ hasRecipe }) => hasRecipe);

    if (addOnsWithRecipes?.length > 0) {
      addOnsWithRecipes.forEach((element) => {
        const { ingredients: addOnsIngredients = [] } = element;
        addOnsIngredients.forEach((ing) => {
          ingredients.push({
            ...ing,
            addOn: element?._id,
            qtyPerOrder: ing.qty * quantity,
            menu: menu._id,
          });
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

    const batchUpdates = new Map();
    const inventoryUpdates = new Map();
    const stockMovements = [];

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

        stockMovements.push({
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
      await StockBatch.bulkWrite([...batchUpdates.values()]);
    }

    if (inventoryUpdates.size > 0) {
      await InventoryItem.bulkWrite([...inventoryUpdates.values()]);
    }

    if (stockMovements.length > 0) {
      await StockMovement.insertMany(stockMovements);
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
      let resell = {};
      if (addOns?.length > 0) {
        addOns.forEach((addOn) => {
          const consumed = consumedBatches.filter(
            (batch) =>
              String(batch.addOn) === String(addOn._id) &&
              batch.menu === menu?._id,
          );
          formattedAddOns.push({
            addOn: addOn?._id,
            recipes: consumed,
            price: addOn.price,
            amount: item?.quantity * addOn.price,
            quantity: 1,
            totalCost: consumed.reduce(
              (sum, batch) => sum + batch.totalCost,
              0,
            ),
          });
        });
      }
      if (menu?.bundleItems?.length > 0 && menu?.type === "bundle") {
        menu.bundleItems.forEach((bundleItem) => {
          if (bundleItem?.type === "prepared") {
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
              quantity: bundleItem.quantity * item?.quantity,
              totalCost: consumed.reduce(
                (sum, batch) => sum + batch.totalCost,
                0,
              ),
            });
          } else {
            const consumed = consumedBatches.find(
              (batch) => batch.bundle === bundleItem?._id && batch.isResell,
            );
            bundleItems.push({
              bundle: bundleItem?._id,
              inventory: bundleItem?.inventory?._id,
              type: "resell",
              costPerUnit: consumed?.costPerUnit,
              price: bundleItem.price,
              amount: bundleItem.quantity * item?.quantity * bundleItem.price,
              quantity: item.quantity * bundleItem.quantity,
              totalCost: consumed.totalCost,
            });
          }
        });
      }

      if (menu?.type === "prepared") {
        recipes = formattedBreakdown(
          menu?._id,
          menu?.ingredients,
          consumedBatches,
          "inventory",
        );
      }
      if (menu?.type === "resell") {
        const consumed = consumedBatches.find(
          (batch) => batch.menu === menu?._id && batch.isResell,
        );
        resell = {
          inventory: menu?.inventory?._id,
          price: menu.price,
          amount: item?.quantity * menu.price,
          quantity: item.quantity,
          totalCost: consumed.totalCost,
          costPerUnit: consumed.costPerUnit,
        };
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
          breakdownRaw.bundleItems.reduce(
            (sum, item) => sum + item.totalCost,
            0,
          ) +
          resell.totalCost || 0;

      items.push({
        order: orderId,
        menu: menu._id,
        quantity: item.quantity,
        amount: menu?.price * item.quantity,
        price: menu?.price,
        breakdown: {
          ...breakdown,
          ...(resell?.inventory && { resell }),
        },
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

    const populatedOrder = await Order.findById(createdOrder._id)
      .populate({
        path: "created.by",
        select: "fullName",
      })
      .lean();

    const populatedItems = await OrderItem.find({ order: createdOrder._id })
      .populate("menu", "name type")
      .populate("breakdown.addOns.addOn", "name")
      .populate("breakdown.bundleItems.bundle", "name");

    const payload = {
      ...populatedOrder,
      items: populatedItems,
    };

    res.status(201).json({
      success: "Order Created Successfully",
      payload,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const cashier = req.query.cashier;
    const orders = await Order.find({
      ...(cashier && { "created.by": cashier }),
    })
      .populate("created.by", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const orderIds = orders.map((order) => order._id);

    const orderItems = await OrderItem.find({
      order: { $in: orderIds },
    })
      .populate("menu", "name type")
      .populate("breakdown.addOns.addOn", "name")
      .populate("breakdown.bundleItems.bundle", "name")
      .lean();

    const itemsByOrder = new Map();

    for (const item of orderItems) {
      const orderId = String(item.order);

      if (!itemsByOrder.has(orderId)) {
        itemsByOrder.set(orderId, []);
      }

      itemsByOrder.get(orderId).push(item);
    }

    const formattedOrders = orders.map((order) => ({
      ...order,
      items: itemsByOrder.get(String(order._id)) || [],
    }));

    res.status(200).json({
      success: "Orders Fetched Successfully",
      payload: formattedOrders,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
