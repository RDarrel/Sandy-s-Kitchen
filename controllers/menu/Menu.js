const Menu = require("../../models/menu/Menu");
exports.save = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json({
      success: "Menu Created Successfully",
      payload: menu,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const menus = await Menu.find({
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: "Menu Fetched Successfully",
      payload: menus,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { _id } = req.body;
    const updatedMenu = await Menu.findByIdAndUpdate(_id, req.body, {
      new: true,
    }).lean();

    res.status(200).json({
      success: "Menu Updated Successfully",
      payload: updatedMenu,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedMenu = await Users.findByIdAndUpdate(
      _id,
      { deletedAt: Date.now() },
      {
        new: true,
      },
    ).lean();
    res.status(200).json({
      success: "Menu Deleted Successfully",
      payload: deletedMenu,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
