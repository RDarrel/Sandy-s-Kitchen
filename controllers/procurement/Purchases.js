const Purchase = require("../../models/procurement/Purchase");
const PurchaseItem = require("../../models/procurement/PurchaseItem");
exports.save = async (req, res) => {
  try {
    const { cart, purchases } = req.body;
    const createdPurchase = await Purchase.insertMany(purchases);
    await Promise.all(
      createdPurchase.map(async (purchase) => {
        const items = cart.filter(
          ({ supplier }) => String(supplier) === String(purchase.supplier),
        );
        const purchaseItems = items.map((item) => ({
          ...item,
          purchase: purchase._id,
        }));

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

exports.browse = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("supplier")
      .lean();

    const orders = await Promise.all(
      purchases.map(async (purchase) => {
        const items = await PurchaseItem.find({
          purchase: purchase._id,
        })
          .populate("inventory")
          .lean();
        return { ...purchase, orders: items };
      }),
    );

    res.status(200).json({
      success: "Purchases Fetched Successfully",
      payload: orders,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
