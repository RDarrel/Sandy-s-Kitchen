const Item = require("../../../models/menu/addons/AddOn");
exports.save = async (req, res) => {
  try {
    const inventory = await Item.create(req.body);
    res.status(201).json({
      success: "Add-on created successfully",
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
      .populate("inventory", "name type category measurement")
      .populate("ingredients.inventory", "name type category measurement")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Add-ons fetched successfully",
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
    })
      .populate("inventory", "name type category measurement")
      .populate("ingredients.inventory", "name type category measurement")
      .lean();

    res.status(200).json({
      success: "Add-on updated successfully",
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
      success: "Add-on deleted successfully",
      payload: item,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
