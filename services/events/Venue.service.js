const { DateTime } = require("luxon");

const Booking = require("../../models/events/Booking");
const Venue = require("../../models/events/Venue");
const dateToUTC = require("../../utilities/dateToUTC");

const TIMEZONE = "Asia/Manila";

const MIN_BOOKING_MINUTES = 60;
const TIME_STEP_MINUTES = 15;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const BLOCKING_STATUSES = ["approved", "confirmed", "setup"];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

const alignToTimeStep = (timestamp) => {
  const step = TIME_STEP_MINUTES * MINUTE_MS;

  return Math.ceil(timestamp / step) * step;
};

const getMinimumDuration = (venue) => {
  const minimumHours = Number(venue.duration?.min);

  if (!Number.isFinite(minimumHours) || minimumHours <= 0) {
    throw new Error(`Invalid minimum duration for venue: ${venue.name}`);
  }

  return Math.max(MIN_BOOKING_MINUTES, minimumHours * 60);
};

const getNumberFilter = ({ min, max, field, integer = false, minimum = 0 }) => {
  const hasMin = hasValue(min);
  const hasMax = hasValue(max);

  if (!hasMin && !hasMax) {
    return null;
  }

  const filter = {};

  if (hasMin) {
    const value = Number(min);

    if (
      !Number.isFinite(value) ||
      value < minimum ||
      (integer && !Number.isInteger(value))
    ) {
      throw new Error(`Invalid minimum ${field}.`);
    }

    filter.$gte = value;
  }

  if (hasMax) {
    const value = Number(max);

    if (
      !Number.isFinite(value) ||
      value < minimum ||
      (integer && !Number.isInteger(value))
    ) {
      throw new Error(`Invalid maximum ${field}.`);
    }

    filter.$lte = value;
  }

  if (hasMin && hasMax && filter.$gte > filter.$lte) {
    throw new Error(`Invalid ${field} range.`);
  }

  return filter;
};

/*
|--------------------------------------------------------------------------
| Check Available Schedule
|--------------------------------------------------------------------------
|
| Finds at least one valid start time on the selected date
| that can accommodate the venue's minimum duration.
|
| Bookings may extend into the following day.
|
*/

const hasAvailableSchedule = (
  reservations,
  dayStart,
  dayEnd,
  minimumMinutes,
  now,
) => {
  const minimumDuration = minimumMinutes * MINUTE_MS;

  const earliestStart = alignToTimeStep(Math.max(dayStart.getTime(), now));

  const latestStart = dayEnd.getTime();

  if (earliestStart >= latestStart) {
    return false;
  }

  const blocks = reservations
    .map(({ startAt, endAt }) => ({
      start: new Date(startAt).getTime(),
      end: new Date(endAt).getTime(),
    }))
    .filter(
      ({ start, end }) =>
        Number.isFinite(start) && Number.isFinite(end) && start < end,
    )
    .sort((a, b) => a.start - b.start);

  let availableFrom = earliestStart;

  for (const block of blocks) {
    const alignedStart = alignToTimeStep(availableFrom);

    // Check whether the minimum duration fits
    // before the next reservation.
    if (
      alignedStart < latestStart &&
      alignedStart + minimumDuration <= block.start
    ) {
      return true;
    }

    // Continue checking after this reservation.
    availableFrom = Math.max(availableFrom, block.end);

    if (alignToTimeStep(availableFrom) >= latestStart) {
      return false;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Final Available Gap
  |--------------------------------------------------------------------------
  |
  | The database query includes reservations extending
  | beyond midnight for the required minimum duration.
  | Therefore, a start time after the final reservation
  | can accommodate the minimum duration.
  |
  */

  return alignToTimeStep(availableFrom) < latestStart;
};

/*
|--------------------------------------------------------------------------
| Filter Available Venues
|--------------------------------------------------------------------------
*/

const filterAvailableVenues = async (venues, date) => {
  if (!date || venues.length === 0) {
    return venues;
  }

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid event date.");
  }

  const parsedDate = DateTime.fromISO(date, {
    zone: TIMEZONE,
  });

  if (!parsedDate.isValid || parsedDate.toFormat("yyyy-MM-dd") !== date) {
    throw new Error("Invalid event date.");
  }

  const dayStart = dateToUTC({
    date,
    dateOnly: true,
  });

  if (!dayStart || Number.isNaN(dayStart.getTime())) {
    throw new Error("Invalid event date.");
  }

  const dayEnd = new Date(dayStart.getTime() + DAY_MS);

  const now = Date.now();

  if (dayEnd.getTime() <= now) {
    return [];
  }

  /*
  |--------------------------------------------------------------------------
  | Determine Reservation Search Window
  |--------------------------------------------------------------------------
  */

  const maximumMinimumMinutes = Math.max(...venues.map(getMinimumDuration));

  const searchEnd = new Date(
    dayEnd.getTime() + maximumMinimumMinutes * MINUTE_MS,
  );

  const venueIds = venues.map(({ _id }) => _id);

  /*
  |--------------------------------------------------------------------------
  | Find Existing Reservations
  |--------------------------------------------------------------------------
  */

  const bookings = await Booking.find({
    deletedAt: null,

    bookingType: {
      $in: ["venue", "both"],
    },

    status: {
      $in: BLOCKING_STATUSES,
    },

    "venue.item": {
      $in: venueIds,
    },

    "venue.schedule.startAt": {
      $lt: searchEnd,
    },

    "venue.schedule.endAt": {
      $gt: dayStart,
    },
  })
    .select("venue.item venue.schedule.startAt venue.schedule.endAt")
    .lean();

  /*
  |--------------------------------------------------------------------------
  | Group Reservations By Venue
  |--------------------------------------------------------------------------
  */

  const reservationsByVenue = new Map();

  for (const booking of bookings) {
    const venueId = String(booking.venue.item);

    if (!reservationsByVenue.has(venueId)) {
      reservationsByVenue.set(venueId, []);
    }

    reservationsByVenue.get(venueId).push({
      startAt: booking.venue.schedule.startAt,
      endAt: booking.venue.schedule.endAt,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Check Each Venue Individually
  |--------------------------------------------------------------------------
  */

  return venues.filter((venue) => {
    const reservations = reservationsByVenue.get(String(venue._id)) || [];

    const minimumMinutes = getMinimumDuration(venue);

    return hasAvailableSchedule(
      reservations,
      dayStart,
      dayEnd,
      minimumMinutes,
      now,
    );
  });
};

/*
|--------------------------------------------------------------------------
| Search Venues
|--------------------------------------------------------------------------
*/

const search = async ({
  minPax,
  maxPax,
  eventType,
  minBudget,
  maxBudget,
  date,
  sortBy = "recommended",
} = {}) => {
  const filter = {
    isAvailable: true,
  };

  /*
  |--------------------------------------------------------------------------
  | Number of Guests
  |--------------------------------------------------------------------------
  */

  const capacityFilter = getNumberFilter({
    min: minPax,
    max: maxPax,
    field: "guest capacity",
    integer: true,
    minimum: 1,
  });

  if (capacityFilter) {
    filter.capacity = capacityFilter;
  }

  /*
  |--------------------------------------------------------------------------
  | Event Type
  |--------------------------------------------------------------------------
  */

  if (hasValue(eventType)) {
    filter.types = eventType;
  }

  /*
  |--------------------------------------------------------------------------
  | Budget
  |--------------------------------------------------------------------------
  */

  const budgetFilter = getNumberFilter({
    min: minBudget,
    max: maxBudget,
    field: "budget",
    minimum: 0,
  });

  if (budgetFilter) {
    filter.basePrice = budgetFilter;
  }

  /*
  |--------------------------------------------------------------------------
  | Sort
  |--------------------------------------------------------------------------
  */

  const sortOptions = {
    recommended: { createdAt: -1 },
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
  };

  const sort = sortOptions[sortBy] || sortOptions.recommended;

  /*
  |--------------------------------------------------------------------------
  | Query Venues
  |--------------------------------------------------------------------------
  */

  let venues = await Venue.find(filter)
    .sort(sort)
    .populate([
      {
        path: "inclusions.item",
        select: "name requirement category",
      },
    ])
    .lean();

  /*
  |--------------------------------------------------------------------------
  | Date Availability
  |--------------------------------------------------------------------------
  */

  if (hasValue(date)) {
    venues = await filterAvailableVenues(venues, date);
  }

  return venues;
};

module.exports = {
  search,
};
