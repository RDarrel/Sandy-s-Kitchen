const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
    },

    qtyPerOrder: {
      type: Number,
      default: 1,
    },
    //if  have a inventory
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("AddOns", modelSchema);

module.exports = Entity;
