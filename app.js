const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const whitelist = require("./config/whitelist");

const app = express();

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

app.use(cors(corsConfig));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

require("./routes")(app);

module.exports = { app, corsConfig };
