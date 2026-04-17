const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MenuCategory", menuCategorySchema);
