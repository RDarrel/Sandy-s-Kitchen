const Equipment = require("../../models/inventory/Equipment");

exports.browse = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 }).lean();
    res
      .status(200)
      .json({ data: equipment, message: "Equipment fetched successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.save = async (req, res) => {
  try {
    const created = await Equipment.create(req.body);
    res
      .status(201)
      .json({ data: created, success: "Equipment created successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Equipment.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    }).lean();
    res
      .status(200)
      .json({ data: updated, success: "Equipment updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Equipment.findByIdAndUpdate(req.body._id, { deletedAt: new Date() });
    res
      .status(200)
      .json({ data: req.body._id, message: "Equipment deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
