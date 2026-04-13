const jwt = require("jsonwebtoken");

const generateToken = payload =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });

module.exports = generateToken;
