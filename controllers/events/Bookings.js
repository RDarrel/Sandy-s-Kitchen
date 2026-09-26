const Booking = require("../../models/events/Booking");
const BookingService = require("../../services/events/Bookings.service");

exports.save = async (req, res) => {
  try {
    const created = await Booking.create(req.body);
    res
      .status(201)
      .json({ data: created, success: "Inquiry submitted  successfully." });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      error: "Failed to save your inquiry. Please try again.",
    });
  }
};

exports.calendar = async (req, res) => {
  try {
    const { start, end, monthStart, monthEnd } = req.query;

    const result = await BookingService.calendar({
      start,
      end,
      monthStart,
      monthEnd,
    });
    return res.status(200).json({
      success: true,
      data: {
        days: result.calendar,
        overview: {
          monthly: result.monthlyOverview,
          totalCount: result.totalBookings[0]?.count || 0,
        },
        visibleRange: {
          start,
          end,
        },
        monthRange: {
          start: monthStart,
          end: monthEnd,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.schedule = async (req, res) => {
  try {
    const { date } = req.query;
    const schedule = await BookingService.schedule({ date });
    return res.status(200).json({
      data: schedule,
    });
  } catch (error) {
    console.log("error", error.message);

    return res.status(500).json({
      error: "Failed to fetch Schedule. Please try again.",
    });
  }
};

exports.me = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: res.locals.caller?._id })
      .populate({
        path: "catering.item",
        select: "inclusions name description",
        populate: { path: "inclusions.item" },
      })
      .populate({
        path: "venue.item",
        populate: { path: "inclusions.item" },
      })
      .populate("catering.mainDishes")
      .populate("catering.sideDishes");

    res.status(200).json({ data: bookings });
  } catch (error) {
    console.log("error", error.mesage);
    res
      .status(500)
      .json({ error: "Failed to fetch my bookings. Please try again" });
  }
};

exports.approve = async (req, res) => {
  try {
    const { _id, eInclusions, cInclusions, userId } = req.body;

    const booking = await BookingService.approve({
      _id,
      eInclusions,
      cInclusions,
      userId,
    });

    return res.status(200).json({
      success: "Booking approved successfully.",
      data: {
        _id: booking._id,
        date: booking.date,
        status: booking.status,
        terms: booking.terms,
        eInclusions: booking?.venue?.inclusions || [],
        cInclusions: booking?.catering?.inclusions || [],
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};
