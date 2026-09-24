const Booking = require("../../models/events/Booking");
const Payment = require("../../models/events/Payment");
const dateToUTC = require("../../utilities/dateToUTC");
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

    const [result] = await Booking.aggregate([
      // Exclude rejected bookings from everything
      {
        $match: {
          status: { $nin: ["rejected"] },
        },
      },

      {
        $facet: {
          // Calendar visible range
          calendar: [
            {
              $match: {
                date: {
                  $gte: dateToUTC({
                    date: start,
                    dateOnly: true,
                  }),
                  $lt: dateToUTC({
                    date: end,
                    dateOnly: true,
                  }),
                },
              },
            },

            // Count bookings per date and status
            {
              $group: {
                _id: {
                  date: "$date",
                  status: "$status",
                },
                count: {
                  $sum: 1,
                },
              },
            },

            // Group all status counts under each date
            {
              $group: {
                _id: "$_id.date",

                statusCounts: {
                  $push: {
                    k: "$_id.status",
                    v: "$count",
                  },
                },
              },
            },

            // Format calendar event
            {
              $project: {
                _id: 0,

                start: "$_id",
                end: "$_id",

                statusCounts: {
                  $arrayToObject: "$statusCounts",
                },
              },
            },

            // Sort by date
            {
              $sort: {
                start: 1,
              },
            },
          ],

          // Exact selected month only
          monthlyOverview: [
            {
              $match: {
                date: {
                  $gte: dateToUTC({
                    date: monthStart,
                    dateOnly: true,
                  }),
                  $lt: dateToUTC({
                    date: monthEnd,
                    dateOnly: true,
                  }),
                },
              },
            },

            // Count bookings per status
            {
              $group: {
                _id: "$status",
                count: {
                  $sum: 1,
                },
              },
            },

            {
              $project: {
                _id: 0,
                status: "$_id",
                count: 1,
              },
            },
          ],

          // Total bookings for exact selected month
          totalBookings: [
            {
              $match: {
                date: {
                  $gte: dateToUTC({
                    date: monthStart,
                    dateOnly: true,
                  }),
                  $lt: dateToUTC({
                    date: monthEnd,
                    dateOnly: true,
                  }),
                },
              },
            },

            {
              $count: "count",
            },
          ],
        },
      },
    ]);

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

    const schedule = await Booking.find({
      date: dateToUTC({
        date,
        dateOnly: true,
      }),

      status: {
        $nin: ["rejected"],
      },
    })
      .populate("customer", "fullName")
      .populate("catering.item", "name description")
      .populate("venue.item", "name description address")
      .populate("catering.inclusions.item")
      .populate("venue.inclusions.item")
      .populate("catering.mainDishes")
      .populate("catering.sideDishes")
      .lean();

    /*
     * Get all booking IDs from today's schedule.
     */
    const bookingIds = schedule.map(({ _id }) => _id);

    /*
     * ONE query for all payments belonging
     * to these bookings.
     */
    const payments = await Payment.find({
      booking: {
        $in: bookingIds,
      },
    })
      .sort({
        paidAt: -1,
      })
      .lean();

    /*
     * Group payments by booking ID.
     *
     * Result:
     *
     * {
     *   bookingId1: [payment1, payment2],
     *   bookingId2: [payment3],
     * }
     */
    const paymentsByBooking = payments.reduce((acc, payment) => {
      const bookingId = payment.booking.toString();

      if (!acc[bookingId]) {
        acc[bookingId] = [];
      }

      acc[bookingId].push(payment);

      return acc;
    }, {});

    /*
     * Attach payments to each booking.
     */
    const scheduleWithPayments = schedule.map((booking) => ({
      ...booking,
      payments: paymentsByBooking[booking._id.toString()] || [],
    }));

    const statusOrder = [
      "pending",
      "approved",
      "confirmed",
      "setup",
      "completed",
      "cancelled",
    ];

    const groupedSchedule = scheduleWithPayments.reduce((acc, booking) => {
      const status = booking.status;

      if (!acc[status]) {
        acc[status] = [];
      }

      acc[status].push(booking);

      return acc;
    }, {});

    const sortedSchedule = Object.fromEntries(
      statusOrder
        .filter((status) => groupedSchedule[status])
        .map((status) => [status, groupedSchedule[status]]),
    );

    return res.status(200).json({
      data: sortedSchedule,
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
    const { eInclusions, cInclusions, _id } = req.body;

    const update = {
      status: "approved",
    };

    if (cInclusions?.length > 0) {
      update["catering.inclusions"] = cInclusions;
    }

    if (eInclusions?.length > 0) {
      update["venue.inclusions"] = eInclusions;
    }

    const booking = await Booking.findByIdAndUpdate(
      _id,
      {
        $set: update,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
      .populate({
        path: "catering.item",
        select: "inclusions name description",
        populate: { path: "inclusions.item" },
      })
      .populate({
        path: "venue.item",
        populate: { path: "inclusions.item" },
      });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: "Booking approved successfully.",
      data: {
        _id: booking?._id,
        date: booking?.date,
        eInclusions: booking?.event?.inclusions || [],
        cInclusions: booking?.catering?.inclusions || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
