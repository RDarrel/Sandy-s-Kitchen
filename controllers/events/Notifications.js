const Notification = require("../../models/events/Notification");

exports.browse = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.query.userId,
    }).sort({ createdAt: -1 });

    res.json({ data: notifications });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch notifications. Please try again." });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.body._id,
      { isRead: true },
      { returnDocument: "after" },
    );

    res.json({
      success: "Notification marked as read successfully.",
      data: notification?._id,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      error: "Failed to mark as read notification. Please try again.",
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.body.userId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      },
    );

    res.json({ success: "All notifications marked as read successfully." });
  } catch (error) {
    res.status(500).json({
      error: "Failed to mark as read notification. Please try again.",
    });
  }
};
