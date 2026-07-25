const CateringPackage = require("../models/CateringPackage");

const packagePopulate = [
  {
    path: "mainCourseCategories.category",
    select: "name",
  },
  {
    path: "mainCourseCategories.choices",
    select: "name description",
  },
  {
    path: "sideMenuCategories.category",
    select: "name",
  },
  {
    path: "sideMenuCategories.choices",
    select: "name description",
  },
  {
    path: "inclusions.item",
    select: "name requirement",
  },
];
exports.save = async (req, res) => {
  try {
    const created = await CateringPackage.create(req.body);
    await created.populate(packagePopulate);
    res
      .status(201)
      .json({ data: created, success: "Package successfully created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const packages = await CateringPackage.find({
      deletedAt: { $exists: false },
    })
      .populate(packagePopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({ data: packages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await CateringPackage.findByIdAndUpdate(
      req.body._id,
      req.body,
      { returnDocument: "after" },
    ).populate(packagePopulate);

    res
      .status(200)
      .json({ data: updated, success: "Package successfully updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    await CateringPackage.findByIdAndUpdate(req.body._id, {
      deletedAt: new Date(),
    });
    res
      .status(200)
      .json({ data: req?.body?._id, success: "Successfully deleted package." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
