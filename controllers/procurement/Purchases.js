const Purchase = require("../../models/procurement/Supplier");

exports.save = async (req, res) => {
  try {
    const createdPurchase = await Purchase.create(req.body);

    res.status(201).json({
      success: "Purchase Created Successfully",
      payload: createdPurchase,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
