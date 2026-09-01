const Venue = require("../../models/events/Venue");

const venuePopulates = [
  {
    path: "inclusions.item",
    select: "name requirement category",
  },
];
exports.save = async (req, res) => {
  try {
    const created = await Venue.create(req.body);
    await created.populate(venuePopulates);
    res
      .status(201)
      .json({ data: created, success: "Venue successfully created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const packages = await Venue.find({
      deletedAt: { $exists: false },
    })
      .populate(venuePopulates)
      .sort({ createdAt: -1 });

    res.status(200).json({ data: packages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Venue.findByIdAndUpdate(req.body._id, req.body, {
      returnDocument: "after",
    }).populate(venuePopulates);

    res
      .status(200)
      .json({ data: updated, success: "Venue successfully updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Venue.findByIdAndUpdate(req.body._id, {
      deletedAt: new Date(),
    });
    res
      .status(200)
      .json({ data: req?.body?._id, success: "Venue successfully deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
