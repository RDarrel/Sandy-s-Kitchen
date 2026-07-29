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

    choices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
  },
  { _id: false },
);

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
    },
    unit: {
      type: String,
      enum: ["qty", "hrs", null],
      default: null,
    },
  },
  { _id: false },
);

const modelSchema = new mongoose.Schema(
  {
    imgId: {
      //ImgId of Cloudinary
      type: String,
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

    isAvailable: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("CateringPackage", modelSchema);

module.exports = Entity;
