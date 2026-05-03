const Purchase = require("../../models/procurement/Purchase");
const PurchaseItem = require("../../models/procurement/PurchaseItem");
const InventoryItem = require("../../models/inventory/Item");
const StockBatch = require("../../models/inventory/StockBatch");
const StockMovement = require("../../models/inventory/StockMovement");

exports.save = async (req, res) => {
  try {
    const { cart, purchases } = req.body;
    const createdPurchase = await Purchase.insertMany(purchases);
    await Promise.all(
      createdPurchase.map(async (purchase) => {
        const items = cart.filter(
          ({ supplier }) => String(supplier) === String(purchase.supplier),
        );
        const purchaseItems = items.map((item) => ({
          ...item,
          purchase: purchase._id,
        }));

        await PurchaseItem.create(purchaseItems);
      }),
    );

    res.status(201).json({
      success: "Purchase Created Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const { status } = req.query;
    const purchases = await Purchase.find({
      status,
    })
      .sort({ createdAt: -1 })
      .populate("supplier")
      .populate("received.by", "fullName")
      .lean();

    const orders = await Promise.all(
      purchases.map(async (purchase) => {
        const items = await PurchaseItem.find({
          purchase: purchase._id,
        })
          .populate("inventory")
          .lean();
        if (
          ["received", "resolved"].includes(purchase.status) &&
          purchase.hasShortDelivery
        ) {
          let = shortDelivery = {};
          const shortDeliveryHistory = await Purchase.find({
            originalPurchase: purchase._id,
          }).lean();

          if (purchase?.status === "resolved") {
            shortDelivery = await Purchase.findOne({
              parentPurchase: purchase._id,
            }).lean();
          }
          return {
            ...purchase,
            shortDeliveryHistory,
            shortDelivery,
            orders: items,
          };
        }

        return {
          ...purchase,
          orders: items,
        };
      }),
    );

    res.status(200).json({
      success: "Purchases Fetched Successfully",
      payload: orders,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const mongoose = require("mongoose");
const { convertToBaseUnit } = require("../../utilities/unitConverter");

const handleShortOrder = async (purchase, orders, session) => {
  const shortOrders = orders.filter(
    ({ quantity }) =>
      Number(quantity?.received || 0) !== Number(quantity?.incoming || 0),
  );

  if (!shortOrders.length) return;

  const formattedShortOrders = shortOrders.map((item) => {
    const { expirationDate, _id, ...rest } = item;

    return {
      ...rest,
      quantity: {
        firstDelivery: Number(item.quantity?.received || 0),
        order:
          Number(item.quantity?.incoming || 0) -
          Number(item.quantity?.received || 0),
      },
    };
  });

  const [purchaseCreated] = await Purchase.create(
    [
      {
        ...purchase,
        _id: undefined,
        hasShortDelivery: true,
        shortItemQty: formattedShortOrders.length,
        totalAmount: purchase?.shortDeliveryAmount || 0,
        originalPurchase: purchase?.originalPurchase || purchase._id,
        parentPurchase: purchase._id,
        status: "review",
      },
    ],
    { session },
  );

  await PurchaseItem.insertMany(
    formattedShortOrders.map((item) => ({
      ...item,
      purchase: purchaseCreated._id,
    })),
    { session },
  );
};

const handleInsertStock = async (purchase, orders, session) => {
  const validOrders = orders.filter(
    (order) => Number(order?.quantity?.received || 0) > 0,
  );

  if (!validOrders.length) return;

  const stockBatches = await StockBatch.insertMany(
    validOrders.map((order) => ({
      inventory: order.inventory,
      purchase: purchase._id,
      quantity: convertToBaseUnit({
        measurement: order.measurement,
        qty: Number(order.quantity?.received || 0),
        unit: order.unit,
      }),
      remainingQuantity: convertToBaseUnit({
        measurement: order.measurement,
        qty: Number(order.quantity?.received || 0),
        unit: order.unit,
      }),
      unit: order.unit,
      costPerUnit: order.cost,
      expirationDate: order.expirationDate || null,
    })),
    { session },
  );

  const stockMovements = stockBatches.map((batch, index) => {
    const order = validOrders[index];

    return {
      inventory: order.inventory,
      stockBatch: batch._id,
      quantity: Number(order.quantity?.received || 0),
      type: "in",
      source: "purchase",
      reference: purchase._id,
      unit: order.unit,
      createdBy: purchase.received?.by || null,
    };
  });

  await StockMovement.insertMany(stockMovements, { session });

  await InventoryItem.bulkWrite(
    orders.map((order) => ({
      updateOne: {
        filter: { _id: order.inventory },
        update: {
          $inc: {
            "stock.current": convertToBaseUnit({
              measurement: order.measurement,
              qty: Number(order.quantity?.received || 0),
              unit: order.unit,
            }),
          },
        },
      },
    })),
    { session },
  );
};

exports.receive_delivery = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { purchase, orders = [] } = req.body;

      if (!purchase?._id) {
        throw new Error("Purchase ID is required.");
      }

      if (!orders.length) {
        throw new Error("No received items found.");
      }

      if (purchase?.isShortDelivery) {
        await handleShortOrder(purchase, orders, session);
      }

      await PurchaseItem.bulkWrite(
        orders.map((order) => ({
          updateOne: {
            filter: {
              _id: order._id,
              purchase: purchase._id,
            },
            update: {
              $set: {
                "quantity.received": Number(order?.quantity?.received || 0),
                expirationDate: order?.expirationDate || null,
              },
            },
          },
        })),
        { session },
      );

      await Purchase.findByIdAndUpdate(
        purchase._id,
        { ...purchase, hasShortDelivery: purchase?.isShortDelivery },
        { session },
      );

      await handleInsertStock(purchase, orders, session);
    });

    return res.status(200).json({
      message: "Delivery received successfully.",
      payload: req.body?.purchase?._id,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Failed to receive delivery.",
    });
  } finally {
    await session.endSession();
  }
};

exports.update = async (req, res) => {
  try {
    const { _id, status, deliveryWindow } = req.body || {};
    const purchaseId = String(_id || "");

    if (!purchaseId) {
      return res.status(400).json({ error: "Purchase ID is required." });
    }

    const nextStatus = String(status || "").toLowerCase();
    const allowedStatuses = ["review", "redelivery", "refunded", "resolved"];

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ error: "Invalid purchase status." });
    }

    const updateDoc = { status: nextStatus };

    if (nextStatus === "redelivery" && deliveryWindow) {
      const from = deliveryWindow?.from;
      const to = deliveryWindow?.to;

      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      if (
        !fromDate ||
        Number.isNaN(fromDate.getTime()) ||
        !toDate ||
        Number.isNaN(toDate.getTime())
      ) {
        return res.status(400).json({ error: "Invalid delivery period." });
      }

      updateDoc.deliveryWindow = {
        from: fromDate,
        to: toDate,
      };
    }

    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { $set: updateDoc },
      { new: true },
    )
      .populate("supplier")
      .populate("received.by", "fullName")
      .lean();

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found." });
    }

    return res.status(200).json({
      success: "Purchase updated successfully.",
      payload: { purchase },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
