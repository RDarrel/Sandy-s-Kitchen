const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["cash", "e_wallet", "bank_transfer"],
      required: true,
    },

    methodImgId: {
      type: String,
      default: null,
    },

    qrImgId: {
      type: String,
      default: null,
    },

    accountName: {
      type: String,
      trim: true,
      default: null,
    },

    accountNumber: {
      type: String,
      trim: true,
      default: null,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
