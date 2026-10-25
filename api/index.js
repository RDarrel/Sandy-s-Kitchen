require("dotenv").config();

const connectToDB = require("../config/db");
const { app } = require("../app");

let connectionPromise;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectToDB().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;

    return app(req, res);
  } catch (error) {
    console.error("[API] Initialization failed:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};
