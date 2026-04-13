const router = require("express").Router(),
  {
    login,
    provideAuth,
    upload,
    // changePassword,
  } = require("../../controllers/persons/Auth"),
  { validate } = require("../../middleware/jwt");

router
  .get("/login", login)
  //   .get("/changePassword", provideToken)
  .get("/validateRefresh", validate, provideAuth)
  .post("/upload", validate, upload);
// .post("/changePassword", changePassword);

module.exports = router;
