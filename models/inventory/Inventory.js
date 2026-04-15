const mongoose = require("mongoose");

// 🔥 central mapping (single source of truth)
const baseUnitMap = {
  weight: "g",
  volume: "ml",
  count: "pcs",
};

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: {
        values: ["ingredient", "resell"],
        message: "{VALUE} is not supported",
      },
      default: "ingredient",
    },

    measurement: {
      type: String,
      enum: ["weight", "volume", "count"],
      required: true,
    },

    baseUnit: {
      type: String,
      enum: ["g", "ml", "pcs"],
    },
    currentStock: {
      type: Number,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// 🔥 CREATE / SAVE middleware
modelSchema.pre("save", function (next) {
  this.baseUnit = baseUnitMap[this.measurement];
  next();
});

// 🔥 UPDATE middleware
modelSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.measurement) {
    update.baseUnit = baseUnitMap[update.measurement];
  }

  next();
});

const Entity = mongoose.model("Inventory", modelSchema);

module.exports = Entity;

// const unitConversion = {
//   weight: {
//     kg: 1000,
//     g: 1,
//   },
//   volume: {
//     L: 1000,
//     ml: 1,
//   },
//   count: {
//     pcs: 1,
//   },
// };

// const convertToBaseUnit = ({ measurement, qty, unit }) => {
//   const multiplier = unitConversion[measurement]?.[unit];

//   if (!multiplier) {
//     throw new Error("Invalid unit");
//   }

//   return qty * multiplier;
// };
