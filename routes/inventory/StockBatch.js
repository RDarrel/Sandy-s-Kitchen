const router = require("express").Router(),
  { browse } = require("../../controllers/inventory/StockBatch"),
  { validate } = require("../../middleware/jwt");

router.get("/browse", validate, browse);

module.exports = router;
