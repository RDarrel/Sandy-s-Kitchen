const Fuels = require("../../models/assets/Fuels"),
  Audit = require("../../models/Audit"),
  Stocks = require("../../models/assets/Stocks"),
  Purchases = require("../../models/assets/Purchases");

const getFuelData = async (fuel) => {
  const [stock, incomingOrders, requestOrders] = await Promise.all([
    Stocks.findOne({ fuel: fuel._id }).lean(),
    Purchases.find({ fuel: fuel._id, status: "incoming" }).lean(),
    Purchases.find({ fuel: fuel._id, status: "request" }).lean(),
  ]);

  const totalIncoming = incomingOrders.reduce(
    (sum, { liters }) => sum + (liters?.incoming || 0),
    0
  );

  const totalRequest = requestOrders.reduce(
    (sum, { liters }) => sum + (liters?.request || 0),
    0
  );

  return {
    ...fuel,
    stock: stock?.liters || 0,
    incoming: totalIncoming || 0,
    request: totalRequest || 0,
  };
};

exports.browse = async (req, res) => {
  try {
    const fuels = await Fuels.find().sort({ createdAt: -1 }).lean();
    const _fuels = await Promise.all(fuels.map(getFuelData));

    res
      .status(200)
      .json({ success: "Fuels Fetched Successfully", payload: _fuels });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const { _id, updateKey, value, markup, description, performBy } = req.body;
    const updatedFuel = await Fuels.findByIdAndUpdate(
      _id,
      { [`pricing.${updateKey}`]: value, "pricing.markup": markup },
      { new: true }
    ).lean();

    await Audit.create({
      user: performBy,
      action: "Update Fuel",
      role: "administrator",
      description,
    });
    const capitalizedKey =
      updateKey.charAt(0).toUpperCase() + updateKey.slice(1);
    const isMarkup = capitalizedKey === "Markup";
    res.status(200).json({
      success: `${updatedFuel?.name} ${capitalizedKey} ${
        !isMarkup ? "Price" : ""
      } Updated Successfully`,
      payload: updatedFuel,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.available = async (_, res) => {
  try {
    const fuels = await Fuels.find().lean();
    const fuelsWithStock = await Promise.all(
      fuels.map(async (fuel) => {
        const { pricing = {}, ...rest } = fuel;
        const { cost = 0, markup = 0 } = pricing;
        const stock = await Stocks.aggregate([
          { $match: { fuel: fuel._id } },
          { $group: { _id: null, total: { $sum: "$liters" } } },
        ]);

        return {
          ...rest,
          stock: stock[0]?.total || 0,
          srp: cost + markup,
          markup,
        };
      })
    );
    const availableFuels = fuelsWithStock.filter((fuel) => fuel.stock > 0);
    res.status(200).json({
      success: "Fuels Fetched Successfully",
      payload: availableFuels,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
