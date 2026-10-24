const router = require("express").Router(),
  { paymentReport, salesReport } = require("../../controllers/reports/Booking"),
  { validate } = require("../../middleware/jwt");

router.get("/payment", paymentReport);
router.get("/sales", validate, salesReport);

module.exports = router;
