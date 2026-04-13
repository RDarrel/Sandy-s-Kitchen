const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    power: {
      type: Number,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Entity = mongoose.model("Roles", modelSchema);

module.exports = Entity;
