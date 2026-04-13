const router = require("express").Router(),
  { browse, update, available } = require("../../controllers/assets/Fuels"),
  { validate } = require("../../middleware/jwt");

router
  .get("/browse", validate, browse)
  .put("/update", validate, update)
  .get("/available", validate, available);

module.exports = router;
