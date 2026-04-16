const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
    ingredients: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
        },
        qty: {
          type: Number,
          required: true,
          default: 1,
        },
        unit: {
          type: String,
          enum: ["kg", "g", "ml", "l", "pcs"],
          required: true,
        },
      },
    ],
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Recipe", modelSchema);

module.exports = Entity;
