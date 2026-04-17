const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    qtyPerOrder: {
      type: Number,
      required: true,
      default: 1,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
    },
  },
  {
    _id: false,
  },
);

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    group: {
      type: String,
      enum: ["extras", "toppings", "sides", "drinks"],
      default: "extras",
    },
    unit: {
      type: String,
      enum: ["kg", "g", "ml", "l", "pcs"],
    },

    qtyPerOrder: {
      type: Number,
      default: 1,
    },
    //if  have a inventory
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("AddOn", modelSchema);

module.exports = Entity;
