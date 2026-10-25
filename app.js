const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsConfig = require("./config/corsConfig");
const connectToDB = require("./config/db");

require("dotenv").config();

const app = express();

app.use(cors(corsConfig));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

let connectionPromise;

app.use(async (req, res, next) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectToDB().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;
    next();
  } catch (error) {
    console.error("[Database] Connection failed:", error);
    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

require("./routes")(app);

module.exports = app;
