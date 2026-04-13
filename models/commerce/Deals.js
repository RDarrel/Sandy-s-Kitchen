const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    liters: {
      type: Number,
      required: true,
    },
    cash: {
      type: Number,
      required: true,
    },

    deletedAt: {
      type: Date,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Stocks = mongoose.model("Deals", userSchema);

module.exports = Stocks;
