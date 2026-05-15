const router = require("express").Router(),
  { browse, dispose } = require("../../controllers/inventory/StockBatch"),
  { validate } = require("../../middleware/jwt");

router.get("/browse", validate, browse).put("/dispose", validate, dispose);

module.exports = router;
