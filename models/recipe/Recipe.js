const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "parentType",
    },

    parentType: {
      type: String,
      required: true,
      enum: ["Menu", "AddOn"],
    },

    ingredients: [
      {
        inventory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
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
