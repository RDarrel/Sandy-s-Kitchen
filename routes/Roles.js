const router = require("express").Router(),
  { browse, save, update, provideToken } = require("../controllers/Roles"),
  { validate } = require("../middleware/jwt");

router
  .get("/", validate, browse)
  .get("/generateToken", provideToken)
  .post("/save", validate, save)
  .put("/update", validate, update);

module.exports = router;
