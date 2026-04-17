const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ["inventory", "baseRecipe"],
      required: true,
      default: "inventory",
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      default: null,
    },

    baseRecipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BaseRecipe",
      default: null,
    },

    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
      required: true,
    },
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
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

    yieldQty: {
      type: Number,
      required: true,
      min: 0.0001,
    },

    yieldUnit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
      required: true,
    },

    ingredients: {
      type: [ingredientSchema],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one ingredient is required.",
      },
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("BaseRecipe", modelSchema);

module.exports = Entity;
