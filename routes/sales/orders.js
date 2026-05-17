const router = require("express").Router(),
  { save, browse } = require("../../controllers/sales/Orders"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save).get("/browse", validate, browse);

module.exports = router;
