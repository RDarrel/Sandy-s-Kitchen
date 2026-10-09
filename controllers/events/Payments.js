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

    let updated;

    if (req.body._id) {
      updated = await Payment.findByIdAndUpdate(req.body._id, req.body, {
        returnDocument: "after",
      });
    } else {
      updated = await Payment.create(req.body);
    }

    await updated.populate([
      { path: "method", select: "name" },
      { path: "reviewedBy", select: "fullName" },
    ]);
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
