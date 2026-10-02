const router = require("express").Router(),
  { save, update } = require("../../controllers/events/Payments"),
  { validate } = require("../../middleware/jwt");

router.post("/save", validate, save).put("/update", validate, update);

module.exports = router;
