const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: {
        values: ["prepared", "resell", "bundle"],
        message: "{VALUE} is not supported",
      },
      default: "prepared",
    },
    category: {
      type: String,
      enum: {
        values: ["main", "side", "drink", "dessert"],
        message: "{VALUE} is not supported",
      },
      default: "main",
    },
    isPublish: Boolean,
    //if type is Resell we need this
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
    qtyPerOrder: {
      type: Number,
      default: 1,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Menu", modelSchema);

module.exports = Entity;
