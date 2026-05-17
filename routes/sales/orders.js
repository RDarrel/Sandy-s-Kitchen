const router = require("express").Router(),
  { save } = require("../../controllers/sales/Orders"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save);

module.exports = router;
