const router = require("express").Router(),
  {
    save,
    calendar,
    schedule,
    me,
  } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/calendar", validate, calendar)
  .get("/schedule", validate, schedule)
  .get("/me", validate, me);

module.exports = router;
