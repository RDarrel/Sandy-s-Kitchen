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
          //For short shipments
          "redelivery",
          "refunded",
          "resolved",
          "cancelled",
        ],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
    isShort: {
      type: Boolean,
      default: false,
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
        ref: "User",
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
