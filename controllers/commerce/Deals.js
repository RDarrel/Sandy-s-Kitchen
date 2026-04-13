const Deals = require("../../models/commerce/Deals"),
  Sold = require("../../models/commerce/Sold"),
  Audit = require("../../models/Audit"),
  Stocks = require("../../models/assets/Stocks");
const dateToUTC = require("../../utilities/dateToUTC");

exports.save = async (req, res) => {
  try {
    const { cart, ...rest } = req.body;
    const deal = await Deals.create(rest);
    const _cart = cart.map((item) => ({ deal: deal?._id, ...item }));
    await Sold.create(_cart);

    let message = _cart
      .map(({ fuelName, amount }) => `₱${amount} of ${fuelName}`) // lagyan ng peso sign
      .join(_cart.length > 1 ? ", " : ""); // join with comma

    if (_cart.length > 1) {
      const lastComma = message.lastIndexOf(",");
      message =
        message.substring(0, lastComma) +
        " and " +
        message.substring(lastComma + 1).trimStart(); // fix spacing after "and"
    }

    await Audit.create({
      description: message,
      action: "sale",
      role: "cashier",
      user: rest.cashier,
    });
    //deduction of stocks
    await Promise.all(
      cart.map((item) =>
        Stocks.findOneAndUpdate(
          { fuel: item.fuel },
          { $inc: { liters: -item.liters } },
          { new: true }
        )
      )
    );

    //populated
    const dealPopulated = await Deals.findOne({ _id: deal._id })
      .populate("cashier", "fullName")
      .lean();
    const cartPopulated = await Sold.find({ deal: deal._id })
      .populate("fuel")
      .lean();

    res.status(201).json({
      success: "Successfully Transaction Created",
      payload: { ...dealPopulated, cart: cartPopulated },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.soldLiters = async (req, res) => {
  try {
    const { cashier, date, timezone = "Asia/Manila" } = req.query;

    const start = dateToUTC(date, timezone, false);
    const end = dateToUTC(date, timezone, true);

    const deals = await Deals.find({
      cashier,
      createdAt: { $gte: start, $lte: end },
    }).lean();
    const liters = deals.reduce((acc, item) => acc + item.liters, 0);
    res.json({
      payload: liters,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toStartOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const toEndOfDayUTC = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

exports.browse = async (req, res) => {
  try {
    const { from, to, isSales = "" } = req.query;

    const start = toStartOfDayUTC(from);
    const end = toEndOfDayUTC(to);

    const deals = await Deals.find({
      createdAt: { $gte: start, $lte: end },
      ...(isSales && { deletedAt: { $exists: false } }),
    })
      .sort({ createdAt: -1 })
      .populate("cashier")
      .lean();

    const dealSolds = await Promise.all(
      deals.map(async (deal) => {
        const cart = await Sold.find({ deal: deal._id })
          .populate("fuel")
          .lean();
        return { ...deal, cart };
      })
    );

    res.status(200).json({
      success: "Deals Fetched Successfully",
      payload: dealSolds,
      isSales: isSales === "true",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id, cart = [], reason, cashier } = req.body;
    await Deals.findByIdAndUpdate(_id, { deletedAt: new Date(), reason });
    await Promise.all(
      cart.map(async (item) => {
        const liters = item?.amount / item?.srp;
        await Sold.findByIdAndUpdate(item?._id, { deletedAt: new Date() });
        await Stocks.findOneAndUpdate(
          { fuel: item.fuel?._id },
          { $inc: { liters: liters } }, // +item.liters para magdagdag
          { new: true }
        );
      })
    );

    let message = cart
      .map(({ fuel, amount }) => `₱${amount} of ${fuel?.name}`) // lagyan ng peso sign
      .join(cart.length > 1 ? ", " : ""); // join with comma

    if (cart.length > 1) {
      const lastComma = message.lastIndexOf(",");
      message =
        message.substring(0, lastComma) +
        " and " +
        message.substring(lastComma + 1).trimStart(); // fix spacing after "and"
    }

    await Audit.create({
      description: message,
      action: "delete sale",
      role: "cashier",
      user: cashier,
    });
    res.json({
      success: "Successfully deleted sale",
      payload: { _id, reason },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
