const Booking = require("../../models/events/Booking");
const BookingService = require("../../services/events/booking");
const NotificationService = require("../../services/events/Notification.service");
const dateToUTC = require("../../utilities/dateToUTC");
const runInBackground = require("../../utilities/runInBackground");

exports.save = async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    let booking;

    if (_id) {
      booking = await Booking.findById(_id);

      if (!booking) {
        return res.status(404).json({
          error: "Booking not found.",
        });
      }

      booking.set(data);

      // Remove unused booking details
      if (booking.bookingType === "venue") {
        booking.set("catering", undefined);
      }

      if (booking.bookingType === "catering") {
        booking.set("venue", undefined);
      }

      await booking.save();

      return res.status(200).json({
        data: booking,
        success: "Booking changes submitted successfully.",
      });
    }

    booking = await Booking.create(data);

    return res.status(201).json({
      data: booking,
      success: "Inquiry submitted successfully.",
    });
  } catch (error) {
    console.log("Error:", error.message);

    return res.status(500).json({
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
        ...result,
        visibleRange: {
          startAt: dateToUTC({
            date: start,
            dateOnly: true,
          }),
          endAt: dateToUTC({
            date: end,
            dateOnly: true,
            endOfDay: true,
          }),
        },
        monthRange: {
          startAt: dateToUTC({
            date: monthStart,
            dateOnly: true,
          }),
          endAt: dateToUTC({
            date: monthEnd,
            dateOnly: true,
            endOfDay: true,
          }),
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

exports.equipmentAvailability = async (req, res) => {
  try {
    const availability = await BookingService.getEquipmentAvailability({
      bookingID: req.query.bookingID,
    });
    res.json({ data: availability });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};

exports.me = async (req, res) => {
  try {
    const bookings = await BookingService.getMyBookings({
      customer: res.locals.caller?._id,
    });

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
    const {
      _id,
      catering,
      event,
      userId,
      status,
      statusTransaction,
      amountReceived,
      totalValueChange,
    } = req.body;

    const booking = await BookingService.approve({
      _id,
      catering,
      event,
      status,
      userId,
    });

    return res.status(200).json({
      success: "Booking approved successfully.",
      data: booking,
      statusTransaction,
      amountReceived,
      totalValueChange,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    try {
      const {
        _id,
        userId,
        statusTransaction,
        amountReceived,
        totalValueChange,
        status = "",
      } = req.body;

      const booking =
        status === "setup"
          ? await BookingService.confirmSetup({
              bookingId: _id,
              user: userId,
            })
          : await BookingService.update({
              bookingToUpdate: req.body,
            });

      if ([1, 5].includes(res.locals.caller?.role)) {
        runInBackground(
          NotificationService.notifyBooking({
            bookingId: _id,
            statusTransaction,
          }),
        );
      }

      return res.status(200).json({
        success: "Booking updated successfully.",
        data: booking,
        statusTransaction,
        ...(status === "approved" && { amountReceived, totalValueChange }),
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.paymentDetails = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await BookingService.getPaymentDetails({
      reference,
      customer: res.locals.caller?._id,
    });

    return res.status(200).json({
      data: booking,
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Failed to fetch payment details" });
  }
};

exports.bookingDetails = async (req, res) => {
  try {
    const { reference } = req.params;

    const booking = await BookingService.getBookingDetails({
      reference,
      role: res.locals.caller?.role,
    });

    return res.status(200).json({
      data: booking,
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
};

exports.venueConflicts = async (req, res) => {
  try {
    const { reference } = req.params;
    const results = await BookingService.getVenueConflicts({ reference });
    res.status(200).json({ data: results });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Failed to fetch venue conflicts." });
  }
};

exports.search = async (req, res) => {
  try {
    const { search } = req.query;
    const results = await BookingService.search({ search });
    res.status(200).json({ data: results });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Failed to search booking" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const {
      statusTransaction = {},
      totalValueChange = 0,
      amountReceived = 0,
      hasRefund = false,
      includeAccount = false,
    } = req.body;
    const result = await BookingService.cancel({
      bookingId: req.body?._id,
      cancellation: req.body.cancellation,
    });

    if ([1, 5].includes(res.locals.caller?.role)) {
      runInBackground(
        NotificationService.notifyCancelledBooking({
          bookingId: req.body?._id,
          hasRefund,
          includeAccount,
        }),
      );
    }
    res.status(200).json({
      data: { ...result, totalValueChange, amountReceived },
      statusTransaction,
    });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ message: "Failed to cancel the booking. Please try again" });
  }
};

exports.refunds = async (req, res) => {
  try {
    const refunds = await BookingService.getRefunds();
    res.status(200).json({ data: refunds });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch refund list. Please try again" });
  }
};

exports.cancelledBookings = async (req, res) => {
  try {
    const bookings = await BookingService.getCancelledCollections({
      ...req.query,
    });
    res.status(200).json({ data: bookings });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch refund list. Please try again" });
  }
};

exports.accountCorrection = async (req, res) => {
  try {
    const correction = await BookingService.accountCorrection({
      bookingId: req.body?._id,
      correction: req.body.correction,
    });

    runInBackground(
      NotificationService.notifyRefundAccountCorrection({
        bookingId: req.body?._id,
      }),
    );
    res.status(200).json({ data: correction });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch refund list. Please try again" });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const processed = await BookingService.processRefund({
      bookingId: req.body?._id,
      process: req.body.process,
    });
    res.status(200).json({ data: processed });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch refund list. Please try again" });
  }
};
