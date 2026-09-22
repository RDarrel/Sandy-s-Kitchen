const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },

  sequence: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
