const Booking = require("../../../models/events/Booking");
const User = require("../../../models/persons/Users");
const dateToUTC = require("../../../utilities/dateToUTC");
const { attachPaymentsToBookings } = require("./helpers/attachPayments");
const { attachRecipesToDishes } = require("./helpers/attachRecipesToDishes");

const getPaymentDetails = async ({ customer, reference }) => {
  const booking = await Booking.findOne({
    customer,
    reference,
  }).lean();

  if (!booking) return {};

  const [bookingWithPayments] = await attachPaymentsToBookings({
    bookings: [booking],
  });

  return bookingWithPayments;
};

const getBookingDetails = async ({ reference, role }) => {
  const booking = await Booking.findOne({
    reference,
  })
    .populate({
      path: "catering.item",
      populate: [
        {
          path: "mainCourseCategories.category",
          select: "name",
        },
        {
          path: "mainCourseCategories.choices",
          select: "name description",
        },
        {
          path: "sideMenuCategories.category",
          select: "name",
        },
        {
          path: "sideMenuCategories.choices",
          select: "name description",
        },
        {
          path: "inclusions.item",
          select: "name requirement category",
        },
      ],
    })
    .populate({
      path: "venue.item",
      populate: { path: "inclusions.item" },
    })
    .populate("customer", "fullName")
    .populate("statusHistory.changedBy", "fullName")
    .populate("catering.inclusions.item", "name category")
    .populate("venue.inclusions.item", "name category")
    .populate("catering.mainDishes.menu")
    .populate("catering.sideDishes.menu")
    .lean();

  if (!booking) return {};

  const [bookingWithPayments] = await attachPaymentsToBookings({
    bookings: [booking],
  });

  if ([1, 5].includes(Number(role)) && booking?.status !== "venue") {
    const [result] = await attachRecipesToDishes([bookingWithPayments]);
    return result;
  }

  return bookingWithPayments;
};

const search = async ({ search }) => {
  const query = search?.trim();

  if (!query) return [];

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const results = await Booking.aggregate([
    // LOOKUP CUSTOMER
    {
      $lookup: {
        from: User.collection.name,
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    },

    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },

    // CREATE SEARCHABLE CUSTOMER NAME
    {
      $addFields: {
        customerFullName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$customer.fullName.fname", ""] },
                " ",
                { $ifNull: ["$customer.fullName.mname", ""] },
                " ",
                { $ifNull: ["$customer.fullName.lname", ""] },
              ],
            },
          },
        },
      },
    },

    // SEARCH BOOKINGS
    {
      $match: {
        $or: [
          { reference: { $regex: escapedQuery, $options: "i" } },
          { customerFullName: { $regex: escapedQuery, $options: "i" } },
          {
            "customer.fullName.fname": {
              $regex: escapedQuery,
              $options: "i",
            },
          },
          {
            "customer.fullName.mname": {
              $regex: escapedQuery,
              $options: "i",
            },
          },
          {
            "customer.fullName.lname": {
              $regex: escapedQuery,
              $options: "i",
            },
          },
          { "customer.email": { $regex: escapedQuery, $options: "i" } },
          { "contact.name": { $regex: escapedQuery, $options: "i" } },
          { "contact.email": { $regex: escapedQuery, $options: "i" } },
          { "contact.phone": { $regex: escapedQuery, $options: "i" } },
        ],
      },
    },

    // SORT AND LIMIT
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 20,
    },

    // RETURN ONLY REQUIRED FIELDS
    {
      $project: {
        reference: 1,
        eventType: 1,
        bookingType: 1,
        status: 1,
        date: 1,
        customerFullName: 1,
        "customer._id": 1,
        "customer.fullName": 1,
        "customer.email": 1,
        "contact.name": 1,
        "contact.email": 1,
        "contact.phone": 1,
        "catering.schedule": 1,
        "venue.schedule": 1,
      },
    },
  ]);

  return results;
};

const getMyBookings = async ({ customer }) => {
  const bookings = await Booking.find({ customer })
    .populate({
      path: "catering.item",
      populate: [
        {
          path: "mainCourseCategories.category",
          select: "name",
        },
        {
          path: "mainCourseCategories.choices",
          select: "name description",
        },
        {
          path: "sideMenuCategories.category",
          select: "name",
        },
        {
          path: "sideMenuCategories.choices",
          select: "name description",
        },
        {
          path: "inclusions.item",
          select: "name requirement category",
        },
      ],
    })
    .populate({
      path: "venue.item",
      populate: { path: "inclusions.item" },
    })
    .populate("catering.inclusions.item", "name category")
    .populate("venue.inclusions.item", "name category")
    .populate("catering.mainDishes.menu")
    .populate("catering.sideDishes.menu")
    .lean();

  return await attachPaymentsToBookings({ bookings });
};

const getVenueConflicts = async ({ reference }) => {
  const booking = await Booking.findOne({ reference }).lean();

  if (!booking?.venue?.item) return [];

  const { startAt, endAt } = booking.venue.schedule;

  const conflicts = await Booking.find({
    _id: { $ne: booking._id },
    status: { $in: ["approved", "confirmed", "setup"] },
    "venue.item": booking.venue.item,
    "venue.schedule.startAt": { $lt: endAt },
    "venue.schedule.endAt": { $gt: startAt },
  })
    .select("reference eventType contact.name status venue.schedule customer")
    .populate("customer", "fullName")
    .sort({ "venue.schedule.startAt": 1 })
    .lean();

  return conflicts.map((conflict) => ({
    ...conflict,
    overlap: {
      startAt: new Date(
        Math.max(
          new Date(startAt).getTime(),
          new Date(conflict.venue.schedule.startAt).getTime(),
        ),
      ),
      endAt: new Date(
        Math.min(
          new Date(endAt).getTime(),
          new Date(conflict.venue.schedule.endAt).getTime(),
        ),
      ),
    },
  }));
};

const getRefunds = async () => {
  const pendingRefunds = await Booking.find({
    status: "cancelled",
    "cancellation.refund.amount": { $gt: 0 },
    "cancellation.refund.status": "pending",
  })
    .select("eventType customer reference cancellation")
    .populate({
      path: "cancellation.refund.accountCorrection.requestedBy",
      select: "fullName",
    })
    .populate({
      path: "cancellation.cancelledBy",
      select: "fullName",
    })

    .populate("customer", "fullName");

  return pendingRefunds;
};

const getCancelledCollections = async ({ startDate, endDate }) => {
  const start = dateToUTC({
    date: startDate,
    dateOnly: true,
  });

  const end = dateToUTC({
    date: endDate,
    dateOnly: true,
    endOfDay: true,
  });

  const cancelledBookings = await Booking.find({
    status: "cancelled",
    $or: [
      {
        "catering.schedule.startAt": { $lte: end },
        "catering.schedule.endAt": { $gte: start },
      },
      {
        "venue.schedule.startAt": { $lte: end },
        "venue.schedule.endAt": { $gte: start },
      },
    ],
  })
    .select("eventType customer reference cancellation")
    .populate("customer", "fullName")
    .populate({
      path: "cancellation.refund.accountCorrection.requestedBy",
      select: "fullName",
    })
    .populate({
      path: "cancellation.refund.processedBy",
      select: "fullName",
    })
    .lean();

  return cancelledBookings;
};
module.exports = {
  search,
  getBookingDetails,
  getPaymentDetails,
  getMyBookings,
  getVenueConflicts,
  getRefunds,
  getCancelledCollections,
};
