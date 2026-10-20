const router = require("express").Router(),
  {
    summary,
    collections,
    topSellingItems,
    upcomingBookings,
    inventoryOverview,
    incomingDeliveries,
  } = require("../controllers/Dashboard"),
  { validate } = require("../middleware/jwt");

router.get("/summary", validate, summary);
router.get("/collections", validate, collections);
router.get("/top-selling-items", validate, topSellingItems);
router.get("/upcoming-bookings", validate, upcomingBookings);
router.get("/inventory-overview", validate, inventoryOverview);
router.get("/incoming-deliveries", validate, incomingDeliveries);

module.exports = router;
