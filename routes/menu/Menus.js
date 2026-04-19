const router = require("express").Router(),
  {
    save,
    browse,
    update,
    destroy,
    availability,
  } = require("../../controllers/menu/Menus"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", validate, browse)
  .put("/update", validate, update)
  .put("/availability", validate, availability)
  .delete("/destroy", validate, destroy);

module.exports = router;
