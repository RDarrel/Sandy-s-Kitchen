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

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    rentalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    rentalDuration: {
      type: Number,
      required: true,
      min: 1,
      default: 8,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
    types: {
      type: [String],
      enum: eventTypes,
      required: true,
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    thumbnail: {
      url: String,
      publicId: String,
    },

    gallery: [
      {
        url: String,
        publicId: String,
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

export default mongoose.model("Venue", venueSchema);
