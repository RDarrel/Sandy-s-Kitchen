const Item = require("../../models/inventory/Item");
const InventoryService = require("../../services/inventory/InventoryItem.service");
const StockBatch = require("../../models/inventory/StockBatch");
const { convertFromBaseUnit } = require("../../utilities/unitConverter");
exports.save = async (req, res) => {
  try {
    const inventory = await Item.create(req.body);
    await inventory.populate("suppliers.supplier");
    res.status(201).json({
      success: "Inventory item Created Successfully",
      payload: inventory,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);

    const rawItems = await Item.find({
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .populate("suppliers.supplier")
      .sort({ createdAt: -1 });

    const expiringSoonStocks = await StockBatch.aggregate([
      {
        $match: {
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

    const expiredStocks = await StockBatch.aggregate([
      {
        $match: {
          remainingQuantity: { $gt: 0 },
          expirationDate: {
            $lt: today,
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

    const expiringSoonMap = expiringSoonStocks.reduce((acc, item) => {
      acc[item._id.toString()] = item.total;
      return acc;
    }, {});

    const expiredMap = expiredStocks.reduce((acc, item) => {
      acc[item._id.toString()] = item.total;
      return acc;
    }, {});

    const items = rawItems.map((item) => {
      const itemId = item._id.toString();
      const unitMap = {
        g: "kg",
        ml: "l",
        pcs: "pcs",
      };

      return {
        ...item.toJSON(),
        expiringSoon: {
          display: expiringSoonMap[itemId]
            ? convertFromBaseUnit({
                measurement: item.measurement,
                qty: expiringSoonMap[itemId],
                unit: unitMap[item.baseUnit],
              })
            : 0,
          value: expiringSoonMap[itemId] || 0,
        },
        expired: {
          display: expiringSoonMap[itemId]
            ? convertFromBaseUnit({
                measurement: item.measurement,
                qty: expiredMap[itemId],
                unit: unitMap[item.baseUnit],
              })
            : 0 || 0,
          value: expiredMap[itemId] || 0,
        },
      };
    });

    res.status(200).json({
      success: "Inventory items fetched successfully",
      payload: items,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const { _id } = req.body;
    const item = await Item.findByIdAndUpdate(_id, req.body, {
      new: true,
    }).populate("suppliers.supplier");

    res.status(200).json({
      success: "Inventory item updated Successfully",
      payload: item,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id } = req.body;
    const item = await Item.findByIdAndUpdate(
      _id,
      { deletedAt: Date.now() },
      {
        new: true,
      },
    ).lean();
    res.status(200).json({
      success: "Inventory item Deleted Successfully",
      payload: item,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.stocks = async (req, res) => {
  try {
    const { inventoryIds = [] } = req.body;

    if (!Array.isArray(inventoryIds)) {
      return res.status(400).json({
        message: "Invalid inventory IDs.",
      });
    }

    const items = await Item.find({
      _id: { $in: inventoryIds },
    })
      .select("_id name baseUnit stock.current")
      .lean();

    return res.status(200).json({ data: items });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch inventory stocks.",
    });
  }
};

exports.stockPlanning = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await InventoryService.getStockPlanning({
      startDate,
      endDate,
    });
    res.json({ data });
  } catch (error) {
    console.log("error", error.message);
    return res.status(500).json({
      message: "Failed to fetch stock planning.",
    });
  }
};
