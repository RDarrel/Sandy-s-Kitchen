const router = require("express").Router(),
  {
    browse,
    dispose,
    reportWaste,
  } = require("../../controllers/inventory/StockBatch"),
  { validate } = require("../../middleware/jwt");

router
  .get("/browse", validate, browse)
  .put("/dispose", validate, dispose)
  .put("/reportWaste", validate, reportWaste);

module.exports = router;
