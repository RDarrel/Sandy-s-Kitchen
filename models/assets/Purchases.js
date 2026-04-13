const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Suppliers",
    },

    fuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fuels",
      required: true,
    },

    liters: {
      //this is for short delivery
      order: {
        type: Number,
        default: 0,
      },
      firstDelivery: {
        type: Number,
        default: 0,
      },
      //
      request: {
        // this is for the request of stockman
        type: Number,
        default: 0,
      },
      incoming: {
        //this is for receive liters
        type: Number,
        default: 0,
      },
      received: {
        type: Number,
        default: 0,
      },
      deny: {
        type: Number,
        default: 0,
      },
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "request", //request,pending,received,denied, review,redelivery,refunded,resolve
    },

    isShort: {
      // kapag kulang yung liters na diniliver
      type: Boolean,
      required: true,
      default: false,
    },

    expectedDelivery: {
      from: {
        type: String,
      },
      to: {
        type: String,
      },
    },

    request: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      date: {
        type: String,
      },
      remarks: {
        type: String,
      },
    },

    received: {
      date: {
        type: String,
      },
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      amount: {
        type: Number,
      },
      remarks: {
        type: String,
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

const Purchases = mongoose.model("Purchases", userSchema);

module.exports = Purchases;
