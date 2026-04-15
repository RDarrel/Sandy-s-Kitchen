const router = require("express").Router(),
  {
    login,
    provideAuth,
    upload,
    // changePassword,
  } = require("../../controllers/persons/Auth"),
  { upload: uploadMiddleware } = require("../../config/cloudinary"),
  { validate } = require("../../middleware/jwt");

router
  .get("/login", login)
  //   .get("/changePassword", provideToken)
  .get("/validateRefresh", validate, provideAuth)
  .post("/upload", validate, uploadMiddleware.single("file"), upload);

module.exports = router;
