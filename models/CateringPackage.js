const mongoose = require("mongoose");

const packageMenuSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    prepQty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const menuCategorySchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },

    limit: {
      type: Number,
      default: 1,
      min: 1,
    },

    choices: [packageMenuSchema],
  },
  { _id: false },
);

const inclusionSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
  {
    imgId: {
      //ImgId of Cloudinary
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    minimumGuests: {
      type: Number,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    addPricePerGuest: {
      // Additional Price Per Guest
      type: Number,
      required: true,
      min: 1,
    },
    mainCourseLimit: {
      type: Number,
      required: true,
    },
    mainCourseCategories: [menuCategorySchema],
    sideMenuCategories: [menuCategorySchema],

    level: {
      //Package Tier
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
    },

    inclusions: [inclusionSchema],

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("CateringPackage", modelSchema);

module.exports = Entity;
