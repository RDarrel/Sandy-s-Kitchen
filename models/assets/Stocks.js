const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fuels",
      required: true,
    },

    liters: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Stocks = mongoose.model("Stocks", userSchema);

module.exports = Stocks;
