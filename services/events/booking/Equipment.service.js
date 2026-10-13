const Booking = require("../../../models/events/Booking");
const Equipment = require("../../../models/inventory/Equipment");

const addUsage = (event) =>
  event?.inclusions
    ?.filter(({ model }) => model === "Equipment")
    .map((inc) => ({
      ...inc,
      usage: {
        start: event?.schedule?.startAt,
        end: event?.schedule?.endAt,
      },
    })) || [];

const getEquipments = (booking) => {
  const { venue, catering } = booking;
  const venueInclusions = addUsage(venue);
  const cateringInclusions = addUsage(catering);
  return [...venueInclusions, ...cateringInclusions];
};

const getEquipmentAvailability = async ({ bookingID }) => {
  const populatedBooking = await Booking.findById(bookingID).lean();

  if (!populatedBooking) {
    throw new Error("Booking not found.");
  }

  const pendingEquipments = getEquipments(populatedBooking);

  if (!pendingEquipments.length) {
    return {};
  }

  const pendingEquipmentIDS = [
    ...new Set(pendingEquipments.map(({ item }) => item.toString())),
  ];

  // Find overall booking schedule boundaries
  const schedules = [
    populatedBooking?.venue?.schedule,
    populatedBooking?.catering?.schedule,
  ].filter((event) => event?.startAt && event?.endAt);

  const bookingStart = new Date(
    Math.min(...schedules.map(({ startAt }) => new Date(startAt).getTime())),
  );

  const bookingEnd = new Date(
    Math.max(...schedules.map(({ endAt }) => new Date(endAt).getTime())),
  );

  // Find bookings with overlapping catering or venue schedules
  const conflictingBookings = await Booking.find({
    _id: { $ne: bookingID },

    status: {
      $in: ["approved", "confirmed", "setup"],
    },

    $or: [
      {
        "venue.schedule.startAt": { $lt: bookingEnd },
        "venue.schedule.endAt": { $gt: bookingStart },
      },
      {
        "catering.schedule.startAt": { $lt: bookingEnd },
        "catering.schedule.endAt": { $gt: bookingStart },
      },
    ],
  })
    .select(
      "venue.schedule.startAt venue.schedule.endAt venue.inclusions " +
        "catering.schedule.startAt catering.schedule.endAt catering.inclusions",
    )
    .lean();

  const reservedEquipments = conflictingBookings.flatMap((booking) =>
    getEquipments(booking),
  );

  const equipments = await Equipment.find({
    _id: { $in: pendingEquipmentIDS },
  })
    .select("totalQty")
    .lean();

  const equipmentsWithAmtUsage = pendingEquipments.map((pending) => {
    const pendingStart = new Date(pending.usage.start).getTime();
    const pendingEnd = new Date(pending.usage.end).getTime();

    const affectedEquipments = reservedEquipments.filter(
      ({ usage, item }) =>
        item.toString() === pending.item.toString() &&
        new Date(usage.start).getTime() < pendingEnd &&
        new Date(usage.end).getTime() > pendingStart,
    );

    const times = affectedEquipments.flatMap(({ usage, amount }) => {
      const start = Math.max(new Date(usage.start).getTime(), pendingStart);

      const end = Math.min(new Date(usage.end).getTime(), pendingEnd);

      return [
        {
          time: start,
          isStart: true,
          amount,
        },
        {
          time: end,
          isStart: false,
          amount,
        },
      ];
    });

    times.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }

      // End before start at the same timestamp
      if (a.isStart === b.isStart) return 0;

      return a.isStart ? 1 : -1;
    });

    let peakAmount = 0;
    let currentTotalAmount = 0;

    times.forEach(({ isStart, amount }) => {
      currentTotalAmount += isStart ? amount : -amount;

      peakAmount = Math.max(peakAmount, currentTotalAmount);
    });

    return {
      ...pending,
      totalAmt: peakAmount,
    };
  });

  const availability = equipments.map((equipment) => {
    const totalAmtReserved = Math.max(
      0,
      ...equipmentsWithAmtUsage
        .filter(({ item }) => equipment._id.toString() === item.toString())
        .map(({ totalAmt }) => totalAmt),
    );

    return {
      ...equipment,
      available: Math.max(0, equipment.totalQty - totalAmtReserved),
    };
  });

  const availabilityMap = Object.fromEntries(
    availability.map(({ _id, available }) => [
      _id.toString(),
      {
        catering: available,
        venue: available,
        available,
      },
    ]),
  );

  return availabilityMap;
};

module.exports = {
  getEquipmentAvailability,
};
