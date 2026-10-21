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
    update,
    search,
    venueConflicts,
    cancel,
  } = require("../../controllers/events/Bookings"),
  { validate } = require("../../middleware/jwt");

router
  .get("/calendar", validate, calendar)
  .get("/equipmentAvailability", validate, equipmentAvailability)
  .get("/me", validate, me)
  .get("/schedule", validate, schedule)
  .get("/search", validate, search)

  .get("/:reference/details", validate, bookingDetails)
  .get("/:reference/payment", validate, paymentDetails)
  .get("/:reference/venue-conflicts", validate, venueConflicts)
  .post("/save", validate, save)
  .put("/cancel", validate, cancel)
  .put("/approve", validate, approve)
  .put("/update", validate, update);

module.exports = router;
