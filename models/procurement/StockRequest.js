const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    quantity: {
      request: {
        type: Number,
        required: true,
        min: 0,
      },
      approved: {
        type: Number,
        default: 0,
      },
    },

    unit: {
      type: String, // Kg, L, Pcs, etc.
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    snapshot: {
      currentStock: { type: Number, default: 0 },
      reorderLevel: { type: Number, default: 0 },
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },
  },
  { _id: true },
);

const modelSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    items: {
      type: [itemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one requested item is required.",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },

    admin: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: {
        type: Date,
      },
      note: {
        type: String,
        trim: true,
      },
    },

    conversion: {
      isConvertedToOrder: {
        type: Boolean,
        default: false,
      },
      convertedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      convertedAt: {
        type: Date,
      },
      purchases: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Purchase",
        },
      ],
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("StockRequest", modelSchema);

module.exports = Entity;
