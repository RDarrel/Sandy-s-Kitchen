const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    type: {
      type: String,
      enum: ["deposit", "partial", "final"],
      required: true,
    },

    method: {
      type: String,
      enum: ["cash", "gcash", "maya", "bank_transfer", "card", "other"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "voided", "refunded"],
      default: "verified",
    },

    reference: {
      type: String,
      trim: true,
      default: null,
    },

    proof: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },
    },

    paidAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  booking: 1,
  paidAt: -1,
});

module.exports = mongoose.model("Payment", paymentSchema);
