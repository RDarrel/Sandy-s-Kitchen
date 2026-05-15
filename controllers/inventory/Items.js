const Item = require("../../models/inventory/Item");
const StockBatch = require("../../models/inventory/StockBatch");
const {
  convertToBaseUnit,
  convertFromBaseUnit,
} = require("../../utilities/unitConverter");
exports.save = async (req, res) => {
  try {
    const inventory = await Item.create(req.body);
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
