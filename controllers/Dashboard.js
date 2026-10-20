const DashboardService = require("../services/Dashbord.service");
exports.summary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await DashboardService.getSummary({ startDate, endDate });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.collections = async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query;
    const result = await DashboardService.getCollections({
      startDate,
      endDate,
      frequency,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.upcomingBookings = async (req, res) => {
  try {
    const result = await DashboardService.getUpcomingBookings();
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.topSellingItems = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await DashboardService.getTopSellingItems({
      startDate,
      endDate,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.inventoryOverview = async (req, res) => {
  try {
    const result = await DashboardService.getInventoryOverview();
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};

exports.incomingDeliveries = async (req, res) => {
  try {
    const result = await DashboardService.getIncomingDeliveries();
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
};
