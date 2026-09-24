const mongoose = require("mongoose");

const bookingPolicySchema = new mongoose.Schema(
  {
    depositPercent: {
      type: Number,
      required: true,
      default: 30,
      min: 0,
      max: 100,
    },

    reservationHoldHours: {
      type: Number,
      required: true,
      default: 24,
      min: 1,
    },

    cancellationDeadlineDays: {
      type: Number,
      required: true,
      default: 7,
      min: 0,
    },

    depositRefundable: {
      type: Boolean,
      required: true,
      default: false,
    },

    balanceDueDaysBeforeEvent: {
      type: Number,
      required: true,
      default: 2,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BookingPolicy", bookingPolicySchema);
