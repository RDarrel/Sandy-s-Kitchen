const router = require("express").Router(),
  { save, browse, update } = require("../../controllers/procurement/StockRequets"),
  { validate } = require("../../middleware/jwt");

router
  .post("/save", validate, save)
  .get("/browse", validate, browse)
  .put("/update", validate, update);

module.exports = router;
