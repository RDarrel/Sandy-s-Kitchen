const router = require("express").Router(),
  { transactionsReport } = require("../../controllers/reports/POS"),
  { validate } = require("../../middleware/jwt");

router.get("/transactions", validate, transactionsReport);

module.exports = router;
