const mongoose = require("mongoose");

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Debut",
  "Christening / Baptism",
  "Corporate Event",
  "Company Party",
  "Seminar / Training",
  "Conference",
  "Team Building",
  "Anniversary",
  "Family Gathering",
  "Reunion",
  "Graduation Party",
  "School Event",
  "Christmas Party",
  "Prom / Ball",
  "Baby Shower",
  "Gender Reveal",
  "Engagement Party",
  "Other",
];

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
const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    duration: {
      min: {
        type: Number,
        required: true,
        min: 1,
      },
      max: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    additionalCharges: {
      perHour: {
        type: Number,
        default: 0,
      },
      perPax: {
        type: Number,
        default: 0,
      },
    },

    types: {
      type: [
        {
          type: String,
          enum: eventTypes,
        },
      ],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one event compatibility is required.",
      },
    },

    setting: {
      type: String,
      enum: ["Indoor", "Outdoor", "Indoor & Outdoor"],
      required: true,
    },

    images: [
      {
        id: Number,
        version: String,
      },
    ],

    isAvailable: {
      type: Boolean,
      default: false,
    },
    inclusions: [inclusionSchema],
  },
  {
    timestamps: true,
  },
);

const Entity = mongoose.model("Venue", venueSchema);

module.exports = Entity;
