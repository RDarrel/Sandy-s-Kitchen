const Booking = require("../../models/events/Booking");
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
      date: dateToUTC({ date, dateOnly: true }),
      status: { $nin: ["rejected"] },
    })
      .populate("customer", "fullName")
      .populate("catering.item")
      .populate("venue.item");

    return res.status(200).json({ data: schedule });
  } catch (error) {
    console.log("error", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch Schedule. Please try again." });
  }
};
