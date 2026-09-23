const Counter = require("./Counter");
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
      enum: ["email", "phone", "sms"],
      required: true,
    },

    specialRequests: {
      type: String,
    },
  },
  { _id: false },
);

const cateringDetailsSchema = new mongoose.Schema(
  {
    item: {
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

    // For own venue only
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

    mainDishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],

    sideDishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
  },
  { _id: false },
);

const venueDetailsSchema = new mongoose.Schema(
  {
    item: {
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

/*
|--------------------------------------------------------------------------
| Pricing Snapshot
|--------------------------------------------------------------------------
*/

const pricingBreakdownSchema = new mongoose.Schema(
  {
    included: {
      type: Number,
      default: 0,
      min: 0,
    },

    booked: {
      type: Number,
      default: 0,
      min: 0,
    },

    extra: {
      type: Number,
      default: 0,
      min: 0,
    },

    rate: {
      type: Number,
      default: 0,
      min: 0,
    },

    charge: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const eventPricingSchema = new mongoose.Schema(
  {
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    guests: {
      type: pricingBreakdownSchema,
      required: true,
    },

    duration: {
      type: pricingBreakdownSchema,
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const pricingSchema = new mongoose.Schema(
  {
    catering: {
      type: eventPricingSchema,
      default: undefined,
    },

    venue: {
      type: eventPricingSchema,
      default: undefined,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

/*
|--------------------------------------------------------------------------
| Payment
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Booking
|--------------------------------------------------------------------------
*/

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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

    pricing: {
      type: pricingSchema,
      required: true,
    },

    payment: {
      type: paymentSchema,
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

bookingSchema.pre("save", async function () {
  if (!this.isNew || this.reference) return;

  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { key: `booking-${year}` },
    { $inc: { sequence: 1 } },
    {
      returnDocument: "after",
      upsert: true,
    },
  );
  const sequence = String(counter.sequence).padStart(4, "0");

  this.reference = `SK-${year}-${sequence}`;
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
