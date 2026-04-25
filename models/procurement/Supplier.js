const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      person: String,
      mobile: {
        type: String,
        required: true,
        trim: true,
      },
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    remarks: {
      type: String,
      trim: true,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
