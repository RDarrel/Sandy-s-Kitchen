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
    availableFor: [{ type: String }],

    status: {
      type: String,
      enum: {
        values: ["pending", "active", "disabled"],
        message: "{VALUE} is not supported.",
      },
      default: "active",
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
