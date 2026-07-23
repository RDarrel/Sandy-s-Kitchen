const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    availableFor: [{ type: String }],

    status: {
      type: String,
      enum: {
        values: ["pending", "active", "disabled"],
        message: "{VALUE} is not supported.",
      },
      default: "active",
    },

    requirement: {
      type: String,
      enum: {
        values: ["none", "hrs", "qty"],
        message: "{VALUE} is not supported.",
      },
      default: "none",
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Services", modelSchema);

module.exports = Entity;
