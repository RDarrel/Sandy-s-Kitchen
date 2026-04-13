const router = require("express").Router(),
  { migrate } = require("../../controllers/migrations/index"),
  { validate } = require("../../middleware/jwt");

router.post("/migrate", validate, migrate);

module.exports = router;
