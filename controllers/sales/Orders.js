const { default: mongoose } = require("mongoose");
const Order = require("../../models/sales/order/Order");
const OrderItem = require("../../models/sales/order/OrderItem");
const StockService = require("../../services/inventory/Stock.service.js");

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
const handleItems = async (itemsRaw, user, orderId, session) => {
  try {
    const items = [];
    // const consumedBatches = await deductStocks(itemsRaw, user);
    const consumedBatches = await StockService.deduct({
      ingredients: getIngredients(itemsRaw),
      quantityKey: "qtyPerOrder",
      source: "order",
      user,
      session,
    });
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
        breakdownRaw.recipes.reduce(
          (sum, batch) => sum + (Number(batch.totalCost) || 0),
          0,
        ) +
        breakdownRaw.addOns.reduce(
          (sum, batch) => sum + (Number(batch.totalCost) || 0),
          0,
        ) +
        breakdownRaw.bundleItems.reduce(
          (sum, item) => sum + (Number(item.totalCost) || 0),
          0,
        ) +
        (Number(resell?.totalCost) || 0);

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

    await OrderItem.insertMany(items, { session });
  } catch (error) {
    console.log("handle items error", error);
    throw error;
  }
};

exports.save = async (req, res) => {
  try {
    const { items, order } = req.body;

    const payload = await mongoose.connection.transaction(async (session) => {
      const [createdOrder] = await Order.create([order], { session });

      await handleItems(items, order.created.by, createdOrder._id, session);

      const populatedOrder = await Order.findById(createdOrder._id)
        .populate({
          path: "created.by",
          select: "fullName",
        })
        .populate("method")
        .session(session)
        .lean();

      const populatedItems = await OrderItem.find({
        order: createdOrder._id,
      })
        .populate("menu", "name type")
        .populate("breakdown.addOns.addOn", "name")
        .populate("breakdown.bundleItems.bundle", "name")
        .session(session)
        .lean();

      return {
        ...populatedOrder,
        items: populatedItems,
      };
    });

    return res.status(201).json({
      success: "Order Created Successfully",
      payload,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
const toStartOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const toEndOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

exports.browse = async (req, res) => {
  try {
    const { from, to, cashier = "" } = req.query;

    const start = toStartOfDayUTC(from);
    const end = toEndOfDayUTC(to);
    const orders = await Order.find({
      ...(cashier && { "created.by": cashier }),
      createdAt: { $gte: start, $lte: end },
    })
      .populate("created.by", "fullName")
      .populate("method")
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
