const router = require("express").Router(),
  { save } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save);

module.exports = router;
