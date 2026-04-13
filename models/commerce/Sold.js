const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deals",
      required: true,
    },

    fuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fuels",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    markup: {
      type: Number,
      required: true,
    },

    srp: {
      type: Number,
      required: true,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Stocks = mongoose.model("Sold", userSchema);

module.exports = Stocks;
