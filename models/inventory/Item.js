const mongoose = require("mongoose");

// 🔥 central mapping (single source of truth)
const baseUnitMap = {
  weight: "g",
  volume: "ml",
  pieces: "pcs",
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
    category: {
      type: String,
      enum: {
        values: [
          "meat",
          "vegetable",
          "seafood",
          "grain",
          "dairy",
          "condiment",
          //for resell
          "beverage",
          "snack",
          "other",
        ],
        message: "{VALUE} is not supported",
      },
      default: "other",
    },

    measurement: {
      type: String,
      enum: ["weight", "volume", "pieces"],
      required: true,
    },
    suppliers: [
      {
        supplier: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supplier",
        },
        cost: {
          type: Number,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    //per kg, L, pcs cost
    cost: {
      type: Number,
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
    deletedAt: {
      type: Date,
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

const Entity = mongoose.model("Item", modelSchema);

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
