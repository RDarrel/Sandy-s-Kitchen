const Entity = require("../../models/persons/Users"),
  handleDuplicate = require("../../config/duplicate"),
  handleQuery = require("../../config/query"),
  bulkWrite = require("../../config/bulkWrite"),
  bcrypt = require("bcryptjs"),
  { ENCRYPT, DECRYPT } = require("../../config/secureData");

const baseUpdate = async (req, res, message) => {
  let data = DECRYPT(req.body.data);

  if (data.hasOwnProperty("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashNewPassword = await bcrypt.hash(data.password, salt);
    data = { ...data, password: hashNewPassword };
  }

  Entity.findByIdAndUpdate(data._id, data, {
    new: true,
    populate: "role",
  })
    .select("-password -__v")
    .then((payload) => {
      if (payload) {
        res.json({
          success: message,
          payload,
        });
      } else {
        res.status(404).json({
          error: "ID Not Found",
          message: "The provided ID does not exist.",
        });
      }
    })
    .catch((error) => res.status(400).json({ error: handleDuplicate(error) }));
};
exports.browse = (req, res) =>
  Entity.find()
    .select("-password -__v")
    .populate({
      path: "role",
      select: "name power",
    })
    .sort({ createdAt: -1 })
    .lean()
    .then((payload) =>
      res.json({
        success: "Users Fetched Successfully",
        payload: payload.filter((e) => e.role.name !== "ADMINISTRATOR"),
      })
    )
    .catch((error) => res.status(400).json({ error: error.message }));

exports.find = (req, res) =>
  Entity.find(handleQuery(req.query))
    .select("-__v -password")
    .populate({
      path: "role",
      select: "name power",
    })
    .sort({ createdAt: -1 })
    .lean()
    .then((payload) =>
      res.json({
        success: "User(s) Found Successfully",
        payload,
      })
    )
    .catch((error) => res.status(400).json({ error: error.message }));

exports.update = (req, res) => {
  if (Array.isArray(req.body)) {
    bulkWrite(req, res, Entity, "Multiple Users Updated Successfully");
  } else {
    baseUpdate(req, res, "User Updated Successfully");
  }
};

exports.destroy = (req, res) => {
  if (Array.isArray(req.body)) {
    bulkWrite(req, res, Entity, "Multiple Users Banned Successfully");
  } else {
    baseUpdate(req, res, "User Banned Successfully");
  }
};

exports.save = (req, res) => {
  const user = DECRYPT(req.body.data);
  Entity.create(user)
    .then((_payload) => {
      const payload = { ..._payload._doc };
      delete payload.password;
      res.status(201).json({
        success:
          "Successfully registered. Please wait for the approval of the admin.",
        payload: ENCRYPT(payload),
      });
    })
    .catch((error) => res.status(400).json({ error: handleDuplicate(error) }));
};
