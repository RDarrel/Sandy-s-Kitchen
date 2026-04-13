const router = require("express").Router(),
  {
    browse,
    find,
    update,
    destroy,
    save,
  } = require("../../controllers/persons/Users"),
  { validate } = require("../../middleware/jwt");

router
  .get("/", validate, browse)
  .get("/find", validate, find)
  .put("/update", validate, update)
  .post("/save", save)
  .delete("/destroy", validate, destroy);

module.exports = router;
