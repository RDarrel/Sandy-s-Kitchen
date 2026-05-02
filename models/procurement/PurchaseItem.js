const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    cost: {
      //Per Unit
      type: Number,
    },
    unit: {
      type: String,
      enum: {
        values: ["kg", "g", "l", "ml", "pcs"],
        message: "{VALUE} is not supported",
      },
      default: "unit",
    },
    expirationDate: {
      type: Date,
    },
    quantity: {
      request: {
        type: Number,
      },
      incoming: {
        type: Number,
      },
      received: {
        type: Number,
      },
      deny: {
        type: Number,
      },
      //For short shipments, how many were short?
      firstDelivery: {
        type: Number,
      },
      order: {
        type: Number,
      },
    },
    originalPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
    parentPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("PurchaseItem", modelSchema);

module.exports = Entity;
