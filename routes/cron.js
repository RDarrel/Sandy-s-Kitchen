const router = require("express").Router();
const syncExpiredBatches = require("../utilities/syncExpiredBatches");

router.get("/expire-jobs", async (req, res) => {
  if (
    !process.env.CRON_SECRET ||
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    await syncExpiredBatches();

    return res.status(200).json({
      message: "Expired batches synchronized successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to synchronize expired batches.",
    });
  }
});

module.exports = router;
