const mongoose = require("mongoose");

const inclusionSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,

      refPath: function (doc, path) {
        return path.replace(/\.item$/, ".model");
      },

      required: true,
    },

    model: {
      type: String,
      enum: ["Equipment", "Services"],
      required: true,
    },

    amount: {
      type: Number,
      min: 0,
    },

    unit: {
      type: String,
      enum: ["qty", "hrs", null],
      default: null,
    },
  },
  {
    _id: false,
  },
);

module.exports = inclusionSchema;
