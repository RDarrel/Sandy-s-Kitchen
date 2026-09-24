const BookingPolicy = require("../../models/events/BookingPolicy");

exports.browse = async (req, res) => {
  try {
    const policy = await BookingPolicy.findOne();

    return res.status(200).json({
      data: policy,
    });
  } catch (error) {
    console.log("Error:", error.message);

    return res.status(500).json({
      error: "Failed to load booking policy. Please try again.",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      depositPercent,
      reservationHoldHours,
      cancellationDeadlineDays,
      balanceDueDaysBeforeEvent,
    } = req.body;

    const policy = await BookingPolicy.findOneAndUpdate(
      {},
      {
        $set: {
          depositPercent,
          reservationHoldHours,
          cancellationDeadlineDays,
          balanceDueDaysBeforeEvent,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      },
    );

    return res.status(200).json({
      data: policy,
      success: "Booking policy updated successfully.",
    });
  } catch (error) {
    console.log("Error:", error.message);

    return res.status(500).json({
      error: "Failed to update booking policy. Please try again.",
    });
  }
};
