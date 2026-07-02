const Entity = require("../../models/persons/Users"),
  Menu = require("../../models/menu/Menu"),
  generateToken = require("../../config/generateToken"),
  { cloudinary } = require("../../config/cloudinary");

exports.login = (req, res) => {
  const { email, password } = req.query;

  Entity.findOne({ email })
    .select("-createdAt -updatedAt -__v")
    .populate({ path: "role", select: "name power" })
    .then(async (item) => {
      if (!item)
        return res.status(404).json({
          error: "User Not Found",
          message: "The provided Credentials does not exist.",
        });

      if (item.wasBanned)
        return res.status(400).json({
          error: "Banned",
          message:
            "You are banned from our website. Please contact the principal or registrar of the school.",
        });

      // if (!item.wasApproved)
      //   return res.status(400).json({
      //     error: "Not Approved",
      //     message: "Waiting for your approval kindly always check your email",
      //   });

      if (!(await item.matchPassword(password)))
        return res.status(400).json({
          error: "Invalid Credentials",
          message: "The provided Credentials does not match.",
        });

      const user = { ...item._doc };
      delete user.password;

      res.cookie("token", generateToken({ _id: item?._id, role: item.role }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600000,
      });

      res.json({
        success: "Login Success",
        payload: {
          user,
        },
      });
    })

    .catch((error) => res.status(400).json({ error: error.message }));
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
    const { folder, filename, userID = "", menuId = "" } = req.body;
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
