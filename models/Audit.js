const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    role: {
      type: String,
    },
    action: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Entity = mongoose.model("Audit", modelSchema);

module.exports = Entity;
