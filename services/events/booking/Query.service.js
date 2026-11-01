const Booking = require("../../../models/events/Booking");
const Payment = require("../../../models/events/Payment");
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
    .populate("cancellation.cancelledBy", "fullName")
    .populate("cancellation.refund.method", "name")
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

    .populate({
      path: "cancellation.refund.accountProvidedByUser",
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
    .populate({
      path: "cancellation.cancelledBy",
      select: "fullName",
    })
    .populate({
      path: "cancellation.refund.accountProvidedByUser",
      select: "fullName",
    })
    .lean();

  return cancelledBookings;
};

const getBookings = async ({
  status = "all",
  search = "",
  service = "all",
  paymentStatus = "all", //all,with_balance,pending_verification,fully_paid,unpaid
  sortOrder = "asc",
  page = 1,
  limit = 5,
} = {}) => {
  const query = typeof search === "string" ? search.trim() : "";
  const normalizeInteger = (value, fallback, maximum) => {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0
      ? Math.min(number, maximum)
      : fallback;
  };
  const pageSize = normalizeInteger(limit, 5, 100);
  const currentPage = normalizeInteger(
    page,
    1,
    Math.floor(Number.MAX_SAFE_INTEGER / pageSize),
  );
  const direction = sortOrder === "desc" ? -1 : 1;
  const pipeline = [
    {
      $match: {
        ...(status !== "all"
          ? { status }
          : !query
            ? {
                status: {
                  $nin: ["rejected", "changes_requested", "cancelled"],
                },
              }
            : {}),
        ...(service !== "all" && { bookingType: service }),
      },
    },
  ];

  if (query) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    pipeline.push(
      {
        $lookup: {
          from: User.collection.name,
          localField: "customer",
          foreignField: "_id",
          as: "searchCustomer",
        },
      },
      {
        $addFields: {
          customerFullName: {
            $trim: {
              input: {
                $concat: [
                  {
                    $ifNull: [
                      { $arrayElemAt: ["$searchCustomer.fullName.fname", 0] },
                      "",
                    ],
                  },
                  " ",
                  {
                    $ifNull: [
                      { $arrayElemAt: ["$searchCustomer.fullName.mname", 0] },
                      "",
                    ],
                  },
                  " ",
                  {
                    $ifNull: [
                      { $arrayElemAt: ["$searchCustomer.fullName.lname", 0] },
                      "",
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            "reference",
            "eventType",
            "customerFullName",
            "searchCustomer.email",
            "searchCustomer.fullName.fname",
            "searchCustomer.fullName.mname",
            "searchCustomer.fullName.lname",
            "contact.name",
            "contact.email",
            "contact.phone",
          ].map((field) => ({
            [field]: { $regex: escapedQuery, $options: "i" },
          })),
        },
      },
      { $unset: ["searchCustomer", "customerFullName"] },
    );
  }

  const sumPayments = (paymentState) => ({
    $sum: {
      $map: {
        input: {
          $filter: {
            input: "$payments",
            as: "payment",
            cond: { $eq: ["$$payment.status", paymentState] },
          },
        },
        as: "payment",
        in: "$$payment.amount",
      },
    },
  });

  pipeline.push(
    {
      $lookup: {
        from: Payment.collection.name,
        localField: "_id",
        foreignField: "booking",
        pipeline: [{ $sort: { createdAt: -1, _id: -1 } }],
        as: "payments",
      },
    },
    {
      $addFields: {
        totalPaid: sumPayments("verified"),
        pendingPayment: sumPayments("pending"),
      },
    },
    {
      $addFields: {
        balance: {
          $max: [
            { $subtract: [{ $ifNull: ["$pricing.total", 0] }, "$totalPaid"] },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        paymentStatus: {
          $switch: {
            branches: [
              { case: { $lte: ["$balance", 0] }, then: "fully_paid" },
              {
                case: { $gt: ["$pendingPayment", 0] },
                then: "pending_verification",
              },
              { case: { $gt: ["$totalPaid", 0] }, then: "with_balance" },
            ],
            default: "unpaid",
          },
        },
      },
    },
  );

  // Filters can overlap: a partially paid booking may also await verification.
  const paymentFilters = {
    with_balance: { totalPaid: { $gt: 0 }, balance: { $gt: 0 } },
    pending_verification: { pendingPayment: { $gt: 0 } },
    fully_paid: { balance: 0 },
    unpaid: { totalPaid: 0, pendingPayment: 0, balance: { $gt: 0 } },
  };
  if (Object.hasOwn(paymentFilters, paymentStatus)) {
    pipeline.push({ $match: paymentFilters[paymentStatus] });
  }

  pipeline.push({
    $facet: {
      bookings: [
        { $sort: { date: direction, _id: direction } },
        { $skip: (currentPage - 1) * pageSize },
        { $limit: pageSize },
      ],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await Booking.aggregate(pipeline);
  const total = result?.total?.[0]?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const populatedBookings = await Booking.populate(result?.bookings ?? [], [
    { path: "customer", select: "fullName" },
    { path: "catering.item", select: "name description" },
    { path: "venue.item", select: "name description address" },
    { path: "catering.inclusions.item" },
    { path: "venue.inclusions.item" },
    { path: "catering.mainDishes.menu" },
    { path: "catering.sideDishes.menu" },
  ]);
  await Payment.populate(
    populatedBookings.flatMap(({ payments }) => payments),
    [
      { path: "method", select: "name" },
      { path: "reviewedBy", select: "fullName" },
    ],
  );
  const bookings = await attachRecipesToDishes(populatedBookings);
  return {
    bookings,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1 && total > 0,
    },
  };
};

const getCounts = async () => {
  const statuses = ["pending", "approved", "confirmed", "setup", "completed"];

  const result = await Booking.aggregate([
    {
      $match: {
        status: { $in: statuses },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = Object.fromEntries(statuses.map((status) => [status, 0]));

  for (const { _id, count } of result) {
    counts[_id] = count;
  }

  counts.all = statuses.reduce((total, status) => total + counts[status], 0);
  return counts;
};

module.exports = {
  search,
  getBookingDetails,
  getPaymentDetails,
  getMyBookings,
  getVenueConflicts,
  getRefunds,
  getCancelledCollections,
  getBookings,
  getCounts,
};
