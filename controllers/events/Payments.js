const Payment = require("../../models/events/Payment");
const Booking = require("../../models/events/Booking");
exports.save = async (req, res) => {
  try {
    const created = await Payment.create(req.body);
    res
      .status(201)
      .json({ data: created, success: "Payment submitted successfully." });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      error: "Failed to submit your payment. Please try again.",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { willConfirmBooking = false, bookingId, reviewedBy } = req.body;

    if (willConfirmBooking) {
      await Booking.findByIdAndUpdate(bookingId, {
        $set: {
          status: "confirmed",
        },
        $push: {
          statusHistory: {
            status: "confirmed",
            changedBy: reviewedBy,
            changedAt: new Date(),
          },
        },
      });
    }
    const updated = await Payment.findByIdAndUpdate(req.body._id, req.body, {
      returnDocument: "after",
    }).populate("method", "name");
    res
      .status(201)
      .json({ data: updated, success: "Payment updated successfully." });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      error: "Failed to update payment. Please try again.",
    });
  }
};
