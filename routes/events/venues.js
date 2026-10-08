const router = require("express").Router(),
  {
    save,
    browse,
    update,
    destroy,
    available,
    getReservedSchedules,
    getAvailableUntil,
  } = require("../../controllers/events/Venues"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", browse)
  .get("/available", available)
  .get("/availability/start", getReservedSchedules)
  .get("/availability/until", getAvailableUntil)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
