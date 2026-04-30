const Purchase = require("../../models/procurement/Purchase");
const PurchaseItem = require("../../models/procurement/PurchaseItem");
exports.save = async (req, res) => {
  try {
    const { cart, purchases } = req.body;
    const createdPurchase = await Purchase.insertMany(purchases);
    await Promise.all(
      createdPurchase.map(async (purchase) => {
        const purchaseItems = cart.filter(
          ({ supplier }) => String(supplier) === String(purchase.supplier),
        );
        await PurchaseItem.create(purchaseItems);
      }),
    );

    res.status(201).json({
      success: "Purchase Created Successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
