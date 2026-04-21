const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      fname: {
        type: String,
        trim: true,
        default: "",
        required: true,
      },
      mname: {
        type: String,
        trim: true,
        default: "",
      },
      lname: {
        type: String,
        trim: true,
        default: "",
      },
      suffix: {
        type: String,
        default: "",
      },
    },
    address: {
      current: {
        street: {
          type: String,
          trim: true,
          default: "",
        },
        barangay: {
          type: String,
          trim: true,
          default: "",
        },
        city: {
          type: String,
          trim: true,
          default: "",
        },
        province: {
          type: String,
          trim: true,
          default: "",
        },
        region: {
          type: String,
          trim: true,
          default: "",
        },
        zip: {
          type: String,
          trim: true,
          default: "",
        },
        hn: {
          type: String,
          trim: true,
          default: "",
        },
      },
      permanent: {
        street: {
          type: String,
          trim: true,
          default: "",
        },
        barangay: {
          type: String,
          trim: true,
          default: "",
        },
        city: {
          type: String,
          trim: true,
          default: "",
        },
        province: {
          type: String,
          trim: true,
          default: "",
        },
        region: {
          type: String,
          trim: true,
          default: "",
        },
        zip: {
          type: String,
          trim: true,
          default: "",
        },
        hn: {
          type: String,
          trim: true,
          default: "",
        },
      },
    },
    googleID: { type: String, default: "" },
    dob: {
      type: String,
      default: "",
    },
    birthplace: {
      type: String,
      default: "",
    },
    role: Number,
    // role: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Roles",
    // },
    mobile: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isMale: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    wasBanned: {
      type: Boolean,
      default: false,
    },

    wasApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
