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
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "voided", "refunded"],
      default: "pending",
    },

    reference: {
      type: String,
      trim: true,
      default: null,
    },

    proofImgId: {
      type: String,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
    origin: {
      type: String,
      default: "online",
    },
    snapshot: {
      bookingTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      verifiedSoFar: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },

    rejectionReason: {
      type: String,
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
