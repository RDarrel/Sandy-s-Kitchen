const router = require("express").Router(),
  {
    browse,
    markAsRead,
    markAllAsRead,
  } = require("../../controllers/events/Notifications"),
  { validate } = require("../../middleware/jwt");

router
  .get("/browse", validate, browse)
  .put("/markAsRead", validate, markAsRead)
  .put("/markAllAsRead", validate, markAllAsRead);

module.exports = router;
