const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    stockBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockBatch",
    },

    type: {
      type: String,
      enum: ["in", "out", "adjustment", "waste"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "l", "ml", "pcs"],
      required: true,
    },

    source: {
      type: String,
      enum: ["purchase", "order", "waste", "manual"],
      required: true,
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId, // purchaseId or orderId
    },

    remarks: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("StockMovement", modelSchema);

module.exports = Entity;
