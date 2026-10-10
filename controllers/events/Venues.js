const Venue = require("../../models/events/Venue");
const Booking = require("../../models/events/Booking");
const VenueService = require("../../services/events/Venue.service.js");
const dateToUTC = require("../../utilities/dateToUTC");

const venuePopulates = [
  {
    path: "inclusions.item",
    select: "name requirement category",
  },
];
exports.save = async (req, res) => {
  try {
    const created = await Venue.create(req.body);
    await created.populate(venuePopulates);
    res
      .status(201)
      .json({ data: created, success: "Venue successfully created." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.browse = async (req, res) => {
  try {
    const packages = await Venue.find({
      deletedAt: { $exists: false },
    })
      .populate(venuePopulates)
      .sort({ createdAt: -1 });

    res.status(200).json({ data: packages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Venue.findByIdAndUpdate(req.body._id, req.body, {
      returnDocument: "after",
    }).populate(venuePopulates);

    res
      .status(200)
      .json({ data: updated, success: "Venue successfully updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    await Venue.findByIdAndUpdate(req.body._id, {
      deletedAt: new Date(),
    });
    res
      .status(200)
      .json({ data: req?.body?._id, success: "Venue successfully deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.available = async (req, res) => {
  try {
    const { pax, start, end, excludeBookingId } = req.query;

    const blockingStatuses = ["approved", "confirmed", "setup"];

    const startAt = dateToUTC({
      date: start,
    });

    const endAt = dateToUTC({
      date: end,
    });

    if (!startAt || !endAt || startAt >= endAt) {
      return res.status(400).json({
        error: "Please provide a valid start and end date and time.",
      });
    }

    const guestCount = Number(pax);

    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      return res.status(400).json({
        error: "Please provide a valid guest count.",
      });
    }

    const conflictQuery = {
      bookingType: {
        $in: ["venue", "both"],
      },

      status: {
        $in: blockingStatuses,
      },

      // Check overlapping venue schedules
      "venue.schedule.startAt": {
        $lt: endAt,
      },

      "venue.schedule.endAt": {
        $gt: startAt,
      },
    };

    // Ignore the booking currently being edited
    if (excludeBookingId) {
      if (!/^[0-9a-fA-F]{24}$/.test(excludeBookingId)) {
        return res.status(400).json({
          error: "Invalid booking ID.",
        });
      }

      conflictQuery._id = {
        $ne: excludeBookingId,
      };
    }

    // Get venue IDs occupied by other bookings
    const conflictingVenueIds = await Booking.distinct(
      "venue.item",
      conflictQuery,
    );

    // Get available venues
    const venues = await Venue.find({
      capacity: {
        $gte: guestCount,
      },

      _id: {
        $nin: conflictingVenueIds,
      },
    })
      .populate(venuePopulates)
      .lean();

    return res.json({
      data: venues,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
const MIN_BOOKING_MINUTES = 45;

exports.getReservedSchedules = async (req, res) => {
  try {
    const { date, excludeBookingId = null, venueId } = req.query;

    const blockingStatuses = ["approved", "confirmed", "setup"];
    if (!date) {
      return res.status(400).json({
        error: "Date is required.",
      });
    }

    if (!venueId) {
      return res.status(400).json({
        error: "Venue is required.",
      });
    }

    const selectedDateStart = dateToUTC({
      date,
      dateOnly: true,
    });

    const nextDateStart = new Date(selectedDateStart);

    nextDateStart.setUTCDate(nextDateStart.getUTCDate() + 1);

    const searchEnd = new Date(
      nextDateStart.getTime() + MIN_BOOKING_MINUTES * 60 * 1000,
    );

    const query = {
      bookingType: {
        $in: ["venue", "both"],
      },

      status: {
        $in: blockingStatuses,
      },

      "venue.item": venueId,

      "venue.schedule.startAt": {
        $lt: searchEnd,
      },

      "venue.schedule.endAt": {
        $gt: selectedDateStart,
      },
    };

    // Ignore the booking currently being edited.
    if (excludeBookingId) {
      query._id = {
        $ne: excludeBookingId,
      };
    }

    const bookings = await Booking.find(query)
      .select("venue.schedule.startAt venue.schedule.endAt")
      .sort({
        "venue.schedule.startAt": 1,
      })
      .lean();

    const reservedSchedules = bookings.map(({ venue }) => ({
      startAt: venue.schedule.startAt,
      endAt: venue.schedule.endAt,
    }));

    return res.json({
      data: reservedSchedules,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getAvailableUntil = async (req, res) => {
  try {
    const { venueId, startAt, excludeBookingId = null } = req.query;

    const blockingStatuses = ["approved", "confirmed", "setup"];

    if (!venueId) {
      return res.status(400).json({
        error: "Venue is required.",
      });
    }

    if (!startAt) {
      return res.status(400).json({
        error: "Start date and time is required.",
      });
    }

    const selectedStartAt = new Date(startAt);

    if (Number.isNaN(selectedStartAt.getTime())) {
      return res.status(400).json({
        error: "Invalid start date and time.",
      });
    }

    const query = {
      bookingType: { $in: ["venue", "both"] },
      status: { $in: blockingStatuses },
      "venue.item": venueId,

      // Get bookings that start after the selected start.
      "venue.schedule.startAt": {
        $gte: selectedStartAt,
      },
    };

    if (excludeBookingId) {
      query._id = {
        $ne: excludeBookingId,
      };
    }

    // Get the nearest upcoming booking.
    const nextBooking = await Booking.findOne(query)
      .select("venue.schedule.startAt")
      .sort({
        "venue.schedule.startAt": 1,
      })
      .lean();

    return res.json({
      data: nextBooking?.venue?.schedule?.startAt ?? null,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.search = async (req, res) => {
  try {
    const venues = await VenueService.search(req.query);
    return res.status(200).json({
      success: true,
      data: venues,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
