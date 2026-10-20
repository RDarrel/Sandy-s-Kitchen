const router = require("express").Router(),
  {
    transactionsReport,
    salesReport,
  } = require("../../controllers/reports/POS"),
  { validate } = require("../../middleware/jwt");

router
  .get("/transactions", validate, transactionsReport)
  .get("/sales", validate, salesReport);

module.exports = router;
