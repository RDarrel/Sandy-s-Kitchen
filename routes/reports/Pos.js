const router = require("express").Router(),
  {
    transactionsReport,
    salesReport,
    analytics,
  } = require("../../controllers/reports/POS"),
  { validate } = require("../../middleware/jwt");

router
  .get("/transactions", validate, transactionsReport)
  .get("/sales", validate, salesReport)
  .get("/analytics", validate, analytics);

module.exports = router;
