const router = require("express").Router(),
  {
    sales,
    topProducts,
    transactions,
    liters,
  } = require("../controllers/Dashboard"),
  { validate } = require("../middleware/jwt");

router
  .get("/sales", validate, sales)
  .get("/topProducts", validate, topProducts)
  .get("/transactions", validate, transactions)
  .get("/liters", validate, liters);

module.exports = router;
