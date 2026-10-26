const mongoose = require("mongoose");
const { convertFromBaseUnit } = require("../../utilities/unitConverter");

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

    conversions: [
      {
        toMeasurement: {
          type: String,
          enum: ["weight", "volume", "pieces"],
          required: true,
        },

        factor: {
          type: Number,
          required: true,
          validate: {
            validator: (value) => Number.isFinite(value) && value > 0,
            message: "Factor must be a positive finite number",
          },
        },

        sourceQty: {
          type: Number,
          required: true,
          min: [Number.EPSILON, "Source quantity must be positive"],
        },

        sourceUnit: {
          type: String,
          enum: ["kg", "g", "ml", "l", "pcs"],
          required: true,
        },

        targetQty: {
          type: Number,
          required: true,
          min: [Number.EPSILON, "Target quantity must be positive"],
        },

        targetUnit: {
          type: String,
          enum: ["kg", "g", "ml", "l", "pcs"],
          required: true,
        },
      },
    ],
    //Track expiration date
    trackExpiration: {
      type: Boolean,
      default: false,
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
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    stock: {
      min: {
        type: Number,
        default: 0,
      },
      current: {
        type: Number,
        default: 0,
      },
      used: {
        type: Number,
        default: 0,
      },
      expired: {
        type: Number,
        default: 0,
      },
    },
    baseUnit: {
      type: String,
      enum: ["g", "ml", "pcs"],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

modelSchema.virtual("supplier").get(function () {
  const primary = this.suppliers?.find((item) => item.isPrimary);
  return primary?.supplier || null;
});

modelSchema.virtual("cost").get(function () {
  const primary = this.suppliers?.find((item) => item.isPrimary);
  return primary?.cost || 0;
});

modelSchema.virtual("stockDisplay").get(function () {
  const unitMap = {
    g: "kg",
    ml: "l",
    pcs: "pcs",
  };
  return {
    current: convertFromBaseUnit({
      measurement: this.measurement,
      qty: this.stock?.current,
      unit: unitMap[this.baseUnit],
    }),
    used: convertFromBaseUnit({
      measurement: this.measurement,
      qty: this.stock?.used,
      unit: unitMap[this.baseUnit],
    }),
  };
});

modelSchema.virtual("stockStatus").get(function () {
  if (this.stockDisplay.current === 0) return "Out of Stock";
  if (this.stockDisplay.current < this.stock.min) return "Low Stock";
  return "In Stock";
});

// 🔥 CREATE / SAVE middleware
modelSchema.pre("save", function () {
  this.baseUnit = baseUnitMap[this.measurement];
});

// 🔥 UPDATE middleware
modelSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (!update) return;

  const measurement = update.$set?.measurement ?? update.measurement;

  if (!measurement) return;

  const baseUnit = baseUnitMap[measurement];

  if (!baseUnit) {
    throw new Error("Invalid inventory measurement");
  }

  // Supports both $set and direct updates
  if (update.$set) {
    update.$set.baseUnit = baseUnit;
  } else {
    update.baseUnit = baseUnit;
  }

  this.setUpdate(update);
});

const Entity = mongoose.model("Item", modelSchema);

module.exports = Entity;
