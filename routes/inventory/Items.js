const router = require("express").Router(),
  {
    save,
    browse,
    update,
    destroy,
    stocks,
  } = require("../../controllers/inventory/Items"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .post("/stocks", validate, stocks)
  .get("/browse", validate, browse)
  .put("/update", validate, update)
  .delete("/destroy", validate, destroy);

module.exports = router;
