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
    const { start, end } = req.query;
    const [result] = await Booking.aggregate([
      {
        $match: {
          status: { $nin: ["rejected"] },
          date: {
            $gte: dateToUTC(start),
            $lte: dateToUTC(end),
          },
        },
      },

      {
        $facet: {
          calendar: [
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

            {
              $group: {
                _id: "$_id.date",

                bookings: {
                  $push: {
                    status: "$_id.status",
                    count: "$count",
                  },
                },
              },
            },

            {
              $project: {
                _id: 0,
                start: "$_id",
                end: "$_id",
                bookings: 1,
              },
            },

            {
              $sort: {
                start: 1,
              },
            },
          ],

          monthlyOverview: [
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

          totalBookings: [
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
