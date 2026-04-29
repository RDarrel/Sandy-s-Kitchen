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
      ref: "Inventory",
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
