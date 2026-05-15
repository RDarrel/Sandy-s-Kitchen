const router = require("express").Router(),
  { browse } = require("../../controllers/inventory/StockMovements"),
  { validate } = require("../../middleware/jwt");

router.get("/browse", validate, browse);

module.exports = router;
