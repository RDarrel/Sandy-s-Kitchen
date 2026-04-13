const Staffs = require("../../models/persons/Staffs"),
  Users = require("../../models/persons/Users");

exports.save = async (req, res) => {
  try {
    const createdUser = await Users.create(req.body);
    const createdStaff = await Staffs.create({ user: createdUser._id });
    const populatedStaff = await Staffs.findById(createdStaff._id).populate({
      path: "user",
      populate: {
        path: "role",
      },
    });

    res.status(201).json({
      success: "Staff Created Successfully",
      payload: populatedStaff,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const staffs = await Staffs.find()
      .populate({
        path: "user",
        populate: {
          path: "role",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Staffs Fetched Successfully",
      payload: staffs,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { user, role, staff } = req.body;
    const updatedStAff = await Users.findByIdAndUpdate(
      user,
      { role },
      { new: true }
    )
      .populate("role")
      .lean();

    res.status(200).json({
      success: "Staff Updated Successfully",
      payload: { user: updatedStAff },
      staff,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
