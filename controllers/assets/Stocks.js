const Stocks = require("../../models/assets/Stocks");

exports.browse = async (req, res) => {
  try {
    const stocks = await Stocks.find()
      .populate("fuel")
      .sort({ createdAt: -1 })
      .lean();

    const arrangedStocks = [...stocks].reduce((acc, curr) => {
      const key = curr.fuel._id;
      const index = acc.findIndex((item) => item.fuel._id === key);
      if (index > -1) {
        acc[index].liters += curr.liters;
      } else {
        acc.push({ fuel: curr.fuel, liters: curr.liters });
      }
      return acc;
    }, []);

    res.status(200).json({
      success: "Stocks Fetched Successfully",
      payload: arrangedStocks,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
