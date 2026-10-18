const router = require("express").Router(),
  { paymentReport } = require("../../controllers/reports/Booking"),
  { validate } = require("../../middleware/jwt");

router.get("/payment", validate, paymentReport);

module.exports = router;
