const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

const Staffs = mongoose.model("Staffs", userSchema);

module.exports = Staffs;
