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
  .put("/report-waste", validate, reportWaste);

module.exports = router;
