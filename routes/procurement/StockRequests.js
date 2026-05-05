const router = require("express").Router(),
  { save } = require("../../controllers/procurement/StockRequets"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save);

module.exports = router;
