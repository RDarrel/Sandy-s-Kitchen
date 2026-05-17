const mongoose = require("mongoose");
const breakdownSchema = new mongoose.Schema(
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

const modelSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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
    },
    breakdown: {
      addOns: [
        {
          addOn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AddOn",
          },
          recipes: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              totalCost: {
                type: Number,
              },
              costPerUnit: {
                type: Number,
              },
              consumedQty: {
                type: Number,
              },
              unit: {
                type: String,
              },
            },
          ],
          totalCost: {
            type: Number,
          },
          price: {
            type: Number,
          },
          quantity: {
            type: Number,
          },
          amount: {
            type: Number,
          },
        },
      ],
      bundleItems: [
        {
          recipes: [
            {
              recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipe",
              },
              totalCost: {
                type: Number,
              },
              costPerUnit: {
                type: Number,
              },
              consumedQty: {
                type: Number,
              },
              unit: {
                type: String,
              },
            },
          ],
          quantity: {
            type: Number,
          },
          totalCost: {
            type: Number,
          },
          bundle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
          },
          amount: {
            type: Number,
          },
          price: {
            type: Number,
          },
        },
      ],
      recipes: [
        {
          recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
          },
          totalCost: {
            type: Number,
          },
          costPerUnit: {
            type: Number,
          },
          consumedQty: {
            type: Number,
          },
          unit: {
            type: String,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("OrderItem", modelSchema);

module.exports = Entity;
