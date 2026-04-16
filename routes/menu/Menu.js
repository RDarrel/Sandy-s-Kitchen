const router = require("express").Router(),
  { save, browse, update, destroy } = require("../../controllers/menu/Menu"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", validate, browse)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
