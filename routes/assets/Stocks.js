const router = require("express").Router(),
  { browse } = require("../../controllers/assets/Stocks"),
  { validate } = require("../../middleware/jwt");

router.get("/browse", validate, browse);

module.exports = router;
