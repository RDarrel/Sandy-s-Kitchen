const BookingReportService = require("../../services/reports/Booking.service");

exports.paymentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await BookingReportService.getPaymentReport({
      startDate,
      endDate,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch payment report." });
  }
};
