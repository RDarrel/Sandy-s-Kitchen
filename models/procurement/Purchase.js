const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryWindow: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },

    status: {
      type: String,
      enum: {
        values: [
          //For incoming deliveries
          "request",
          "incoming",
          "received",
          "cancelled",

          //For short shipments
          "review",
          "redelivery",
          "refunded",
          "resolved",
        ],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    hasShortDelivery: {
      type: Boolean,
      default: false,
    },
    shortItemQty: {
      type: Number,
      default: 0,
    },
    originalPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
    parentPurchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
    request: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: {
        type: String,
      },
    },

    received: {
      date: {
        type: Date,
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      at: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      note: {
        type: String,
      },
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Purchase", modelSchema);

module.exports = Entity;
