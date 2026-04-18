const Item = require("../../models/menu/MenuCategory");
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
    const items = await Item.find({
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Inventory items Fetched Successfully",
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
    }).lean();

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
