const StockRequest = require("../../models/procurement/StockRequest");
exports.save = async (req, res) => {
  try {
    await StockRequest.create(req.body);
    res.status(201).json({
      success: "Request Created Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const stockRequests = await StockRequest.find({
      status: req.query.status,
      deletedAt: { $exists: false },
    })
      .populate("requestedBy", "fullName email")
      .populate({
        path: "items.inventory",
        populate: {
          path: "suppliers.supplier", // depende sa schema mo
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: "Stock Requests Fetched Successfully",
      payload: stockRequests,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body?._id) {
      res.status(400).json({ error: "Stock request id is required." });
      return;
    }

    const existing = await StockRequest.findOne({
      _id: req.body._id,
    });

    if (!existing) {
      res.status(404).json({ error: "Stock request not found." });
      return;
    }

    const nextItems = Array.isArray(req.body?.items) ? req.body.items : null;
    if (nextItems) {
      existing.items = nextItems;
    }

    if (typeof req.body?.status === "string") {
      existing.status = req.body.status;
    }

    if (req.body?.admin && typeof req.body.admin === "object") {
      existing.admin = {
        ...(existing.admin?.toObject
          ? existing.admin.toObject()
          : existing.admin),
        ...req.body.admin,
      };
    }

    if (req.body?.conversion && typeof req.body.conversion === "object") {
      existing.conversion = {
        ...(existing.conversion?.toObject
          ? existing.conversion.toObject()
          : existing.conversion),
        ...req.body.conversion,
      };
    }

    const updated = await existing.save();
    const populated = await updated.populate({
      path: "items.inventory",
    });
    res.status(200).json({
      success: "Stock Request Updated Successfully",
      payload: populated,
      isAdmin: req.body?.isAdmin,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const deleted = await StockRequest.findByIdAndUpdate(
      req.body?._id,
      { deletedAt: new Date() },
      { new: true },
    );

    res.status(200).json({
      success: "Stock Request Deleted Successfully",
      payload: deleted?._id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
