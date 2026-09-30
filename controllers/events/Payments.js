const Payment = require("../../models/events/Payment");

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
