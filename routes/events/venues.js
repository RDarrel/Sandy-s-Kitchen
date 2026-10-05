const router = require("express").Router(),
  {
    save,
    browse,
    update,
    destroy,
    available,
  } = require("../../controllers/events/Venues"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", browse)
  .get("/available", available)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
