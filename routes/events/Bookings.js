const router = require("express").Router(),
  {
    save,
    calendar,
    schedule,
    me,
    approve,
  } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router
  .get("/calendar", validate, calendar)
  .get("/schedule", validate, schedule)
  .get("/me", validate, me)
  .post("/save", validate, save)
  .put("/approve", validate, approve);

module.exports = router;
