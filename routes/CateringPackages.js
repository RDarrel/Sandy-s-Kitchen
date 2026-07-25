const router = require("express").Router(),
  { save } = require("../controllers/CateringPackages"),
  { validate } = require("../middleware/jwt");

router.post("/save", validate, save);

module.exports = router;
