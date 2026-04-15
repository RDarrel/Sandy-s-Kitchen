const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    stock: {
      type: Number,
      default: 1,
      required: true,
    },
    //Optional if have a expiration date
    expDate: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("StockBatches", modelSchema);

module.exports = Entity;
