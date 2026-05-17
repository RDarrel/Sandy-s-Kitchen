const router = require("express").Router(),
  { save } = require("../../controllers/sales/Order"),
  { validate } = require("../../middleware/jwt");

router.get("/save", validate, save);

module.exports = router;
