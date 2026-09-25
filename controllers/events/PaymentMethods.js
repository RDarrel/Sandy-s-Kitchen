const PaymentMethod = require("../../models/events/PaymentMethods");

exports.save = async (req, res) => {
  try {
    const method = await PaymentMethod.create(req.body);
    res.status(201).json({
      success: "Payment Method Created Successfully",
      data: method,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const items = await PaymentMethod.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: "Payment Methods Fetched Successfully",
      payload: items,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { _id } = req.body;
    const item = await PaymentMethod.findByIdAndUpdate(_id, req.body, {
      returnDocument: "after",
    }).lean();

    res.status(200).json({
      success: "Payment method updated Successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id } = req.body;
    const item = await PaymentMethod.findByIdAndUpdate(
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
    res.status(500).json({ error: error.message });
  }
};
