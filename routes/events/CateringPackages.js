const router = require("express").Router(),
  {
    save,
    browse,
    search,
    update,
    destroy,
  } = require("../../controllers/events/CateringPackages"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", browse)
  .get("/search", search)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
