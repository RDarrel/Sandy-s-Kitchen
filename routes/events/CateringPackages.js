const router = require("express").Router(),
  {
    save,
    browse,
    update,
    destroy,
  } = require("../../controllers/events/CateringPackages"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", browse)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
