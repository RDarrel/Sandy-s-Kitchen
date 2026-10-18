const Booking = require("../../models/events/Booking");
const OrderItem = require("../../models/sales/order/OrderItem.js");
const Purchase = require("../../models/procurement/Purchase.js");
const PurchaseItem = require("../../models/procurement/PurchaseItem.js");
const InventoryItem = require("../../models/inventory/Item.js");
const dateToUTC = require("../../utilities/dateToUTC");
const { convertToBaseUnit } = require("../../utilities/unitConverter.js");
const { DateTime } = require("luxon");

const HISTORY_DAYS = 30;
const TIMEZONE = "Asia/Manila";

// Treat tiny floating-point residuals as zero.
const normalizeQty = (value) => {
  const qty = Number(value) || 0;
  return Math.abs(qty) < 1e-10 ? 0 : qty;
};

const getStockPlanning = async ({ startDate, endDate }) => {
  const start = dateToUTC({
    date: startDate,
    timezone: TIMEZONE,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    timezone: TIMEZONE,
    dateOnly: true,
    endOfDay: true,
  });

  if (!start || !end || start > end) {
    throw new Error("Invalid stock planning date range.");
  }

  const startDay = DateTime.fromJSDate(start, { zone: "utc" })
    .setZone(TIMEZONE)
    .startOf("day");

  const endDay = DateTime.fromJSDate(end, { zone: "utc" })
    .setZone(TIMEZONE)
    .startOf("day");

  const planningDays = Math.floor(endDay.diff(startDay, "days").days) + 1;

  const dateKeys = Array.from({ length: planningDays }, (_, index) =>
    startDay.plus({ days: index }).toISODate(),
  );

  /*
   * 1. Get approved/confirmed catering bookings.
   */
  const bookings = await Booking.find({
    status: { $in: ["approved", "confirmed"] },
    "catering.schedule.startAt": {
      $gte: start,
      $lte: end,
    },
    $or: [
      { "catering.mainDishes.0": { $exists: true } },
      { "catering.sideDishes.0": { $exists: true } },
    ],
  })
    .select(
      "reference status catering.schedule.startAt catering.mainDishes catering.sideDishes",
    )
    .populate("catering.mainDishes.ingredients.inventory")
    .populate("catering.sideDishes.ingredients.inventory")
    .lean();

  const cateringMap = new Map();
  const cateringByDateMap = new Map();

  bookings.forEach((booking) => {
    const catering = booking.catering ?? {};

    const bookingDate = DateTime.fromJSDate(
      new Date(catering.schedule.startAt),
      { zone: "utc" },
    )
      .setZone(TIMEZONE)
      .toISODate();

    if (!bookingDate) return;

    const dishes = [
      ...(catering.mainDishes ?? []),
      ...(catering.sideDishes ?? []),
    ];

    dishes.forEach((dish) => {
      dish?.ingredients?.forEach((ingredient) => {
        const inventory = ingredient?.inventory;

        if (!inventory?._id) return;

        const inventoryId = inventory._id.toString();
        const qty = Number(ingredient.requiredQty ?? 0);

        if (!Number.isFinite(qty) || qty <= 0) return;

        const convertedQty = convertToBaseUnit({
          measurement: inventory.measurement,
          qty,
          unit: ingredient.unit,
        });

        if (!Number.isFinite(convertedQty) || convertedQty <= 0) {
          return;
        }

        cateringMap.set(
          inventoryId,
          (cateringMap.get(inventoryId) ?? 0) + convertedQty,
        );

        if (!cateringByDateMap.has(inventoryId)) {
          cateringByDateMap.set(inventoryId, new Map());
        }

        const dateMap = cateringByDateMap.get(inventoryId);

        dateMap.set(
          bookingDate,
          (dateMap.get(bookingDate) ?? 0) + convertedQty,
        );
      });
    });
  });

  /*
   * 2. Get incoming purchases.
   */
  const incomingPurchases = await Purchase.find({
    status: { $in: ["incoming", "redelivery"] },
    "deliveryWindow.to": { $lte: end, $gte: start },
  })
    .select("_id status deliveryWindow")
    .lean();

  const purchaseById = new Map(
    incomingPurchases.map((purchase) => [purchase._id.toString(), purchase]),
  );

  const purchaseIds = incomingPurchases.map(({ _id }) => _id);

  const incomingItems = purchaseIds.length
    ? await PurchaseItem.find({
        purchase: { $in: purchaseIds },
      })
        .populate("inventory")
        .lean()
    : [];

  const incomingMap = new Map();
  const incomingByDateMap = new Map();

  incomingItems.forEach((item) => {
    const inventory = item.inventory;

    if (!inventory?._id || !item.purchase) return;

    const purchase = purchaseById.get(item.purchase.toString());

    if (!purchase?.deliveryWindow?.to) return;

    const arrivalDate = DateTime.fromJSDate(
      new Date(purchase.deliveryWindow.to),
      { zone: "utc" },
    )
      .setZone(TIMEZONE)
      .toISODate();

    if (!arrivalDate) return;

    const rawQty =
      purchase.status === "redelivery"
        ? item.quantity?.order
        : item.quantity?.incoming;

    const qty = Number(rawQty);

    if (rawQty == null || !Number.isFinite(qty) || qty <= 0) {
      return;
    }

    const convertedQty = convertToBaseUnit({
      measurement: inventory.measurement,
      qty,
      unit: item.unit,
    });

    if (!Number.isFinite(convertedQty) || convertedQty <= 0) {
      return;
    }

    const inventoryId = inventory._id.toString();

    incomingMap.set(
      inventoryId,
      (incomingMap.get(inventoryId) ?? 0) + convertedQty,
    );

    if (!incomingByDateMap.has(inventoryId)) {
      incomingByDateMap.set(inventoryId, new Map());
    }

    const dateMap = incomingByDateMap.get(inventoryId);

    dateMap.set(arrivalDate, (dateMap.get(arrivalDate) ?? 0) + convertedQty);
  });

  /*
   * 3. Get POS consumption from the past 30 days.
   */
  const now = DateTime.now().setZone(TIMEZONE);

  const historyEnd = now.toUTC().toJSDate();
  const historyStart = now.minus({ days: HISTORY_DAYS }).toUTC().toJSDate();

  const orderItems = await OrderItem.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "orderData",
      },
    },
    {
      $unwind: "$orderData",
    },
    {
      $match: {
        "orderData.created.at": {
          $gte: historyStart,
          $lt: historyEnd,
        },
      },
    },
    {
      $project: {
        breakdown: 1,
      },
    },
  ]);

  /*
   * 4. Aggregate POS consumption by inventory ID.
   *
   * Assumption:
   * consumedQty and resell quantities are already in base units.
   */
  const posMap = new Map();

  const addConsumption = (ingredient) => {
    const inventoryId = ingredient?.inventory;

    if (!inventoryId || ingredient?.consumedQty == null) return;

    const key = inventoryId.toString();
    const qty = Number(ingredient.consumedQty);

    if (!Number.isFinite(qty) || qty < 0) return;

    posMap.set(key, (posMap.get(key) ?? 0) + qty);
  };

  const addResellConsumption = (item) => {
    if (!item?.inventory || item.quantity == null) return;

    const key = item.inventory.toString();
    const qty = Number(item.quantity);

    if (!Number.isFinite(qty) || qty < 0) return;

    posMap.set(key, (posMap.get(key) ?? 0) + qty);
  };

  orderItems.forEach(({ breakdown }) => {
    breakdown?.recipes?.forEach(addConsumption);

    breakdown?.addOns?.forEach((addOn) => {
      addOn?.recipes?.forEach(addConsumption);
    });

    breakdown?.bundleItems?.forEach((bundleItem) => {
      bundleItem?.recipes?.forEach(addConsumption);
    });

    addResellConsumption(breakdown?.resell);

    breakdown?.bundleItems?.forEach((bundleItem) => {
      if (bundleItem?.type === "resell") {
        addResellConsumption(bundleItem);
      }
    });
  });

  /*
   * 5. Calculate average daily POS demand.
   */
  const posDailyMap = new Map();

  posMap.forEach((historicalQty, inventoryId) => {
    posDailyMap.set(inventoryId, historicalQty / HISTORY_DAYS);
  });

  /*
   * 6. Fetch POS inventory items to check their base units.
   */
  const posInventoryIds = [...posDailyMap.keys()];

  const posInventoryItems = posInventoryIds.length
    ? await InventoryItem.find({
        _id: { $in: posInventoryIds },
      }).select("_id baseUnit")
    : [];

  /*
   * 7. Exclude pcs items with average daily POS demand below 1.
   */
  const excludedPosIds = new Set(
    posInventoryItems
      .filter(
        (item) =>
          item.baseUnit === "pcs" &&
          (posDailyMap.get(item._id.toString()) ?? 0) * planningDays < 1,
      )
      .map((item) => item._id.toString()),
  );

  excludedPosIds.forEach((id) => {
    posDailyMap.delete(id);
  });

  /*
   * 8. Fetch inventory items.
   */
  const inventoryIds = new Set([
    ...cateringMap.keys(),
    ...posDailyMap.keys(),
    ...incomingMap.keys(),
  ]);

  const inventoryItems = inventoryIds.size
    ? await InventoryItem.find({
        _id: { $in: [...inventoryIds] },
      }).populate("suppliers.supplier")
    : [];

  const inventoryById = new Map(
    inventoryItems.map((item) => [item._id.toString(), item.toObject()]),
  );

  /*
   * 9. Calculate daily stock projections, purchase quantities,
   * and stock alerts.
   */

  const stockPlanning = [];

  inventoryIds.forEach((inventoryId) => {
    const inventory = inventoryById.get(inventoryId);

    if (!inventory) return;

    const cateringNeeded = cateringMap.get(inventoryId) ?? 0;

    const estimatedPosNeeded =
      (posDailyMap.get(inventoryId) ?? 0) * planningDays;

    const totalNeeded = cateringNeeded + estimatedPosNeeded;

    const currentStock = Number(inventory.stock?.current ?? 0);

    // Keep stock.min in the database.
    // Treat it as the reorder level, not the purchase target.
    const reorderLevel = convertToBaseUnit({
      measurement: inventory.measurement,
      qty: Number(inventory.stock?.min ?? 0),
      unit:
        inventory.baseUnit === "g"
          ? "kg"
          : inventory.baseUnit === "ml"
            ? "l"
            : inventory.baseUnit,
    });

    const incomingByDateMapForItem =
      incomingByDateMap.get(inventoryId) ?? new Map();

    const cateringByDateMapForItem =
      cateringByDateMap.get(inventoryId) ?? new Map();

    const incomingByDate = Object.fromEntries(
      [...incomingByDateMapForItem.entries()].sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB),
      ),
    );

    const cateringByDate = Object.fromEntries(
      [...cateringByDateMapForItem.entries()].sort(([dateA], [dateB]) =>
        dateA.localeCompare(dateB),
      ),
    );

    let projectedStock = currentStock;
    let lowestProjectedStock = currentStock;

    let firstShortageDate = null;
    let firstReorderDate = null;

    const dailyProjection = {};

    dateKeys.forEach((date) => {
      const incomingQty = incomingByDateMapForItem.get(date) ?? 0;
      const cateringQty = cateringByDateMapForItem.get(date) ?? 0;
      const posQty = posDailyMap.get(inventoryId) ?? 0;

      projectedStock = normalizeQty(
        projectedStock + incomingQty - posQty - cateringQty,
      );

      lowestProjectedStock = Math.min(lowestProjectedStock, projectedStock);

      const hasShortage = projectedStock < 0;

      const belowReorderLevel = normalizeQty(projectedStock - reorderLevel) < 0;

      if (hasShortage && !firstShortageDate) {
        firstShortageDate = date;
      }

      if (belowReorderLevel && !firstReorderDate) {
        firstReorderDate = date;
      }

      dailyProjection[date] = {
        incomingQty,
        estimatedPosNeeded: posQty,
        cateringNeeded: cateringQty,
        projectedStock,
        reorderLevel,
        belowReorderLevel,
        shortage: Math.max(0, normalizeQty(-projectedStock)),
      };
    });

    // Purchase only enough to cover the deepest projected shortage.
    // This accounts for the timing of incoming deliveries and demand.
    const shortage = Math.max(0, normalizeQty(-lowestProjectedStock));

    const toPurchaseQty = shortage;

    let stockAlert;

    if (firstShortageDate) {
      stockAlert = {
        type: "shortage",
        title: "Projected Shortage",
        date: firstShortageDate,
      };
    } else if (firstReorderDate) {
      stockAlert = {
        type: "reorder",
        title: "Reorder Recommended",
        date: firstReorderDate,
      };
    } else {
      stockAlert = {
        type: "sufficient",
        title: "Sufficient",
        date: null,
      };
    }

    stockPlanning.push({
      ...inventory,
      currentStock,
      reorderLevel,
      cateringNeeded,
      estimatedPosNeeded,
      totalNeeded,
      incomingQty: incomingMap.get(inventoryId) ?? 0,
      incomingByDate,
      cateringByDate,
      projectedStock,
      lowestProjectedStock,
      shortage,
      suggestedPurchaseQty: toPurchaseQty,
      toPurchaseQty,
      firstShortageDate,
      firstReorderDate,
      stockAlert,
      dailyProjection,
    });
  });

  return stockPlanning;
};

module.exports = {
  getStockPlanning,
};
