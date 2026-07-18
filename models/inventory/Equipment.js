const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "Furniture",
          "Tableware",
          "Buffet Equipment",
          "Audio & Video",
          "Electrical",
          "Decorations",
          "Kitchen Equipment",
          "Others",
        ],
        message: "{VALUE} is not supported",
      },
      default: "Furniture",
    },

    totalQty: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: {
        values: ["pcs", "set", "unit", "pair"],
        message: "{VALUE} is not supported",
      },
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Equipment", modelSchema);

module.exports = Entity;
