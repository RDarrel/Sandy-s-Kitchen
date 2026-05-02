const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    remainingQuantity: {
      type: Number,
      required: true,
    },

    costPerUnit: {
      type: Number,
      required: true,
    },
    // totalCost: { compute this using virtual (costPerUnit and quantity)
    //   type: Number,
    // },
    unit: {
      type: String,
      enum: {
        values: ["kg", "g", "ml", "l", "pcs"],
        message: "{VALUE} is not supported",
      },
      required: true,
    },

    expirationDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["available", "consumed", "expired"],
      default: "available",
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("StockBatch", modelSchema);

module.exports = Entity;
