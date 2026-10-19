const PosReportService = require("../../services/reports/POS.service");

exports.transactionsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await PosReportService.getTransactionsReport({
      startDate,
      endDate,
    });
    res.json({ data: result });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch transactions report." });
  }
};
