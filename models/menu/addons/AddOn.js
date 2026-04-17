const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    group: {
      type: String,
      enum: ["extras", "toppings", "sides", "drinks"],
      default: "extras",
    },
    unit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
    },
    hasRecipe: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("AddOn", modelSchema);

module.exports = Entity;
