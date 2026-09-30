const router = require("express").Router(),
  {
    save,
    calendar,
    equipmentAvailability,
    schedule,
    me,
    approve,
    paymentDetails,
    bookingDetails,
  } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router
  .get("/calendar", validate, calendar)
  .get("/equipmentAvailability", validate, equipmentAvailability)
  .get("/me", validate, me)
  .get("/schedule", validate, schedule)

  .get("/:reference/details", validate, bookingDetails)
  .get("/:reference/payment", validate, paymentDetails)
  .post("/save", validate, save)
  .put("/approve", validate, approve);

module.exports = router;
