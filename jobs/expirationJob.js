const cron = require("node-cron");
const syncExpiredBatches = require("../utilities/syncExpiredBatches");
cron.schedule("0 0 * * *", syncExpiredBatches);
