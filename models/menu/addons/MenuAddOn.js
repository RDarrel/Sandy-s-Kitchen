const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
    addOn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddOn",
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("MenuAddOn", modelSchema);

module.exports = Entity;
