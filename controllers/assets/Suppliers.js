const Suppliers = require("../../models/assets/Suppliers");

exports.save = async (req, res) => {
  try {
    const createdSupplier = await Suppliers.create(req.body);

    res.status(201).json({
      success: "Supplier Created Successfully",
      payload: createdSupplier,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const suppliers = await Suppliers.find({ deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Suppliers Fetched Successfully",
      payload: suppliers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updatedSuppliers = await Suppliers.findByIdAndUpdate(
      req.body._id,
      req.body,
      { new: true }
    ).lean();

    res.status(200).json({
      success: "Supplier Updated Successfully",
      payload: updatedSuppliers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const deletedSupplier = await Suppliers.findByIdAndUpdate(
      req.body?._id,
      { deletedAt: new Date() },
      { new: true }
    ).lean();

    res.status(200).json({
      success: "Supplier Deleted Successfully",
      payload: deletedSupplier?._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
