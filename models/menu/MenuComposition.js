const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
    },
    item: [
      {
        menu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
        },
        qty: {
          type: Number,
          required: true,
          default: 1,
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

const Entity = mongoose.model("MenuComposition", modelSchema);

module.exports = Entity;
