const router = require("express").Router(),
  { paymentReport, salesReport, analytics } = require("../../controllers/reports/Booking"),
  { validate } = require("../../middleware/jwt");

router.get("/payment", paymentReport);
router.get("/sales", validate, salesReport);
router.get("/analytics", validate, analytics);

module.exports = router;
