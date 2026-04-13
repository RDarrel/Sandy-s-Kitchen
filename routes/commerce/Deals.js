const router = require("express").Router(),
  {
    save,
    soldLiters,
    browse,
    destroy,
  } = require("../../controllers/commerce/Deals"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/soldLiters", validate, soldLiters)
  .get("/browse", validate, browse)
  .delete("/destroy", validate, destroy);

module.exports = router;
