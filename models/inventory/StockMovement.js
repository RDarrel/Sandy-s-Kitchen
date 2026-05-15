const mongoose = require("mongoose");
const { convertFromBaseUnit } = require("../../utilities/unitConverter");

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
      enum: [
        "purchase",
        "order",
        "manual",
        "expired",
        "damaged",
        "spoiled", //panis,mabaho
        "other",
      ],
      required: true,
    },
    batches: [
      {
        stockBatch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StockBatch",
        },
        quantity: {
          type: Number,
        },
      },
    ],

    reference: {
      type: mongoose.Schema.Types.ObjectId, // purchaseId or orderId
    },

    remarks: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

modelSchema.virtual("quantityDisplay").get(function () {
  return convertFromBaseUnit({
    qty: this.quantity,
    unit: this.unit,
  });
});
const Entity = mongoose.model("StockMovement", modelSchema);

module.exports = Entity;
