const whitelist = require("./whitelist");
const corsConfig = {
  origin: whitelist,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "X-Requested-With",
    "Accept",
    "Authorization",
  ],
};
module.exports = corsConfig;
