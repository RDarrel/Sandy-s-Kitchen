const mongoose = require("mongoose");

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
      default: 3,
    },
    level: {
      //Package Tier
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
    },
    menuCategories: [
      {
        selectionLimit: {
          type: Number,
          default: 1,
        },
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuCategory",
          required: true,
        },
        menus: [
          {
            menu: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Menu",
            },
            prepQty: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],

    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],

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
