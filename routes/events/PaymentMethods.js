const router = require("express").Router(),
  { save, browse, update } = require("../../controllers/events/PaymentMethods"),
  { validate } = require("../../middleware/jwt");

router
  .get("/browse", validate, browse)
  .post("/save", validate, save)
  .put("/update", validate, update);

module.exports = router;
