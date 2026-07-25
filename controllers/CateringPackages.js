const CateringPackage = require("../models/CateringPackage");

exports.save = async (req, res) => {
  try {
    const created = await CateringPackage.create(req.body);
    res
      .status(201)
      .json({ data: created, success: "Package successfully created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
