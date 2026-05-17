const mongoose = require("mongoose");

const recipeCostSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    costPerUnit: {
      type: Number,
      required: true,
    },
    consumedQty: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const addOnBreakdownSchema = new mongoose.Schema(
  {
    addOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOn",
      required: true,
    },
    recipes: [recipeCostSchema],
    quantity: Number,
    price: Number,
    amount: Number,
    totalCost: Number,
  },
  { _id: false },
);

const resellBreakdownSchema = new mongoose.Schema(
  {
    recipe: {
      inventory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      totalCost: {
        type: Number,
        required: true,
      },
      costPerUnit: {
        type: Number,
        required: true,
      },
      consumedQty: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    },
    quantity: Number,
    price: Number,
    amount: Number,
    totalCost: Number,
  },
  { _id: false },
);

const bundleItemBreakdownSchema = new mongoose.Schema(
  {
    bundle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    recipes: [recipeCostSchema],
    resell: resellBreakdownSchema,
    quantity: Number,
    price: Number,
    amount: Number,
    totalCost: Number,
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
      default: 0,
    },

    breakdown: {
      recipes: [recipeCostSchema],
      addOns: [addOnBreakdownSchema],
      bundleItems: [bundleItemBreakdownSchema],
      resell: resellBreakdownSchema,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("OrderItem", modelSchema);

module.exports = Entity;
