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

exports.browse = async (req, res) => {
  try {
    const pkg = await CateringPackage.findOne();
    const packages = await CateringPackage.find({
      deletedAt: { $exists: false },
    })
      .populate("mainCourseCategories.category", "name")
      .populate("mainCourseCategories.choices", "name description")
      .populate("sideMenuCategories.category", "name")
      .populate("sideMenuCategories.choices", "name description")
      .populate("inclusions.item", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: packages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
