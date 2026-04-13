const router = require("express").Router(),
  { roles } = require("./Roles"),
  { users } = require("./Users"),
  { projects } = require("./Projects");

module.exports = app => {
  app.use(
    "/migrate",
    router
      .post("/roles", roles)
      .post("/users", users)
      .post("/projects", projects)
  );
};
