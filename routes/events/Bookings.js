const router = require("express").Router(),
  { save, calendar } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save).get("/calendar", calendar);

module.exports = router;
