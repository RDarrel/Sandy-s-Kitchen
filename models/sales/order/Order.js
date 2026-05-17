const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    cash: {
      type: Number,
      required: true,
    },
    orderType: {
      type: String,
      enum: ["dine-in", "take-out"],
      default: "dine-in",
    },
    created: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      at: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Order", modelSchema);

module.exports = Entity;
