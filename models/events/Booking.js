const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    preferredContact: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
  },
  { _id: false },
);

const selectedMenuSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    chosen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
  },
  { _id: false },
);

const cateringDetailsSchema = new mongoose.Schema(
  {
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CateringPackage",
      required: true,
    },

    pax: {
      type: Number,
      required: true,
      min: 1,
    },

    time: {
      start: {
        type: String,
      },
      end: {
        type: String,
      },
    },

    venueOption: {
      type: String,
      enum: ["own_venue", "book_venue"],
      required: true,
    },

    //for own_venue only
    venue: {
      address: {
        type: String,
        trim: true,
      },

      location: {
        type: String,
        trim: true,
      },
    },

    mainDishes: [selectedMenuSchema],
    sideDishes: [selectedMenuSchema],
  },
  { _id: false },
);

const venueDetailsSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    pax: {
      type: Number,
      required: true,
      min: 1,
    },

    time: {
      start: {
        type: String,
      },
      end: {
        type: String,
      },
    },
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "refunded"],
      default: "unpaid",
    },

    proof: {
      type: String,
    },

    paidAt: {
      type: Date,
    },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    contact: {
      type: contactSchema,
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["catering", "venue", "both"],
      required: true,
    },

    eventType: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
    catering: {
      type: cateringDetailsSchema,
    },

    venue: {
      type: venueDetailsSchema,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true,
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "completed", "cancelled"],
          required: true,
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        reason: {
          type: String,
          trim: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    notes: {
      type: String,
      trim: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
