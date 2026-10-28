const BookingReportService = require("../../services/reports/Booking.service");

exports.paymentReport = async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query;
    const result = await BookingReportService.getPaymentReport({
      startDate,
      endDate,
      frequency,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch payment report." });
  }
};

exports.salesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await BookingReportService.getSalesReport({
      startDate,
      endDate,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch sales report." });
  }
};

exports.analytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await BookingReportService.getAnalytics({
      startDate,
      endDate,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(error.status || 500).json({ error: error.status === 400 ? error.message : "Failed to fetch booking analytics." });
  }
};
