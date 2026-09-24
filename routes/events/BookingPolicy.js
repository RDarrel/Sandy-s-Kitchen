const router = require("express").Router(),
  { browse, update } = require("../../controllers/events/BookingPolicy"),
  { validate } = require("../../middleware/jwt");

router.get("/browse", validate, browse).put("/update", validate, update);

module.exports = router;
