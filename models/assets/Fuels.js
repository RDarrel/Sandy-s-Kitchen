const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    pricing: {
      cost: {
        type: Number,
        required: true,
      },
      markup: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
      },
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Fuels = mongoose.model("Fuels", userSchema);

module.exports = Fuels;
