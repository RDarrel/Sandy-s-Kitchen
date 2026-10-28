const Entity = require("../../models/persons/Users"),
  Menu = require("../../models/menu/Menu"),
  Booking = require("../../models/events/Booking"),
  PaymentMethod = require("../../models/events/PaymentMethods"),
  Payment = require("../../models/events/Payment"),
  generateToken = require("../../config/generateToken"),
  handleDuplicate = require("../../config/duplicate"),
  AuthService = require("../../services/auth/Auth.service"),
  { cloudinary } = require("../../config/cloudinary");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

exports.login = (req, res) => {
  const { email, password } = req.query;

  Entity.findOne({ email })
    .select("-createdAt -updatedAt -__v")
    .then(async (item) => {
      if (!item)
        return res.status(401).json({
          error: "Invalid Credentials",
          message: "The email or password you entered is incorrect.",
        });

      if (item.wasBanned)
        return res.status(403).json({
          error: "Account Suspended",
          message:
            "Your account has been suspended. Please contact support for assistance.",
        });

      if (!item.password || !(await item.matchPassword(password))) {
        return res.status(401).json({
          error: "Invalid Credentials",
          message: "The email or password you entered is incorrect.",
        });
      }
      const user = { ...item._doc };
      delete user.password;

      res.cookie("token", generateToken({ _id: item?._id, role: item.role }), {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 4,
      });

      res.json({
        success: "Login Success",
        payload: {
          user,
        },
      });
    })

    .catch((error) => {
      console.log("error", error);
      res.status(400).json({ error: error.message });
    });
};

exports.googleSignIn = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        message: "Google authorization code is required",
      });
    }

    const googleUser = await AuthService.googleAuth({ code });

    const { googleId, email, name, emailVerified = false } = googleUser;
    if (!googleId || !email || !emailVerified) {
      return res.status(403).json({
        error: "Google Sign-In Failed",
        message: "We couldn't verify your Google account. Please try again.",
      });
    }

    let user = await Entity.findOne({ googleId }).select("fullName email role");

    if (!user) {
      const userByEmail = await Entity.findOne({ email });
      if (userByEmail) {
        return res.status(409).json({
          error: "Account Already Exists",
          message:
            "This email is already registered. Please sign in with your email and password instead.",
        });
      } else {
        const [fname = "", ...rest] = (name || "").trim().split(/\s+/);
        const lname = rest.join(" ");
        const createdUser = await Entity.create({
          email,
          fullName: {
            fname,
            lname,
          },
          googleId,
          role: 6,
        });

        user = await Entity.findById(createdUser._id).select(
          "fullName email role",
        );
      }
    }
    res.cookie("token", generateToken({ _id: user?._id, role: user.role }), {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 4,
    });

    return res.status(200).json({
      success: "Google identity verified successfully",
      payload: {
        user,
      },
    });
  } catch (error) {
    console.error("Google authentication failed:", error);

    return res.status(401).json({
      message: "Google authentication failed",
    });
  }
};

exports.provideAuth = async (_, res) => {
  const user = res.locals.caller;
  res.json({
    success: "Validatation Success",
    payload: { user },
  });
};

exports.upload = async (req, res) => {
  try {
    const file = req.file;
    const {
      folder,
      filename,
      attributeName = "", // attribute name in the model
      userID = "",
      menuId = "",
      paymentMethodId = "",
      paymentID = "",
      bookingId = "", //for uploading of proof of refund
    } = req.body;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!folder || !filename) {
      return res
        .status(400)
        .json({ message: "Folder and filename are required" });
    }

    const mime = file.mimetype;
    const isImage = mime.startsWith("image/");
    const resourceType = isImage ? "auto" : "raw";

    const streamUpload = (fileBuffer, folder, publicId) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            overwrite: true,
            invalidate: true, // invalidate cache
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(file.buffer, folder, filename);

    if (userID) {
      await Entity.updateOne(
        { _id: userID },
        { $set: { pid: `v${result.version}` } },
      );
    }
    if (menuId) {
      await Menu.updateOne(
        { _id: menuId },
        { $set: { imgId: `v${result.version}` } },
      );
    }

    if (paymentMethodId) {
      await PaymentMethod.updateOne(
        { _id: paymentMethodId },
        { $set: { [attributeName]: `v${result.version}` } },
      );
    }

    if (paymentID) {
      await Payment.updateOne(
        { _id: paymentID },
        { $set: { proofImgId: `v${result.version}` } },
      );
    }

    if (bookingId) {
      await Booking.updateOne(
        { _id: bookingId },
        { $set: { "cancellation.refund.proofImgId": `v${result.version}` } },
      );
    }

    return res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
      public_id: result.public_id,
      imgId: `v${result.version}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};

exports.save = (req, res) => {
  Entity.create({ ...req.body, role: 6 })
    .then((_payload) => {
      res.status(201).json({
        success:
          "Successfully registered. Please wait for the approval of the admin.",
      });
    })
    .catch((error) => res.status(400).json({ error: handleDuplicate(error) }));
};

exports.logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    message: "Logged out successfully",
  });
};
