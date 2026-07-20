const Service = require("../../models/resources/Services");

exports.browse = async (req, res) => {
  try {
    const { module = "" } = req.query;
    if (!module)
      return res.status(400).json({
        error: "Missing required query parameter",
        message: "The 'module' query parameter is required.",
      });

    const services = await Service.find({
      ...(module !== "all" && { availableFor: req.query.module }),
    });
    res.status(200).json({ data: services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.save = async (req, res) => {
  try {
    const created = await Service.create(req.body);
    res
      .status(201)
      .json({ data: created, success: "Service successfully created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
    }).lean();
    res
      .status(200)
      .json({ data: updated, success: "Service successfully updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id = "" } = req.body;
    if (!_id)
      return res.status(400).json({
        error: "Missing required query parameter",
        message: "The '_id' query parameter is required.",
      });

    await Service.findByIdAndUpdate(_id, { deletedAt: new Date() });
    res.status(200).json({ data: _id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
