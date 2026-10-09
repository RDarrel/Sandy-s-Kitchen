import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { Building2, Sparkles, Utensils } from "lucide-react";
export const getServiceRows = (booking) => {
  const rows = [];
  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    rows.push({
      type: "venue",

      icon: Building2,

      iconClassName: "text-amber-700",

      name: booking?.venue?.item?.name || "Venue reservation",

      subtitle: booking?.venue?.item?.setting || "Event venue",

      pax: booking?.venue?.pax || 0,

      time: booking?.venue?.schedule,

      label: "Venue",

      accentClassName: "border-l-2 border-l-amber-500",

      location: booking?.venue?.item?.address,

      inclusions: booking?.venue?.inclusions || [],

      pricing: booking?.pricing?.venue,
    });
  }
  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    rows.push({
      type: "catering",

      icon: Utensils,

      iconClassName: "text-rose-700",

      name: booking?.catering?.item?.name || "Catering package",

      subtitle: "Food service",

      pax: booking?.catering?.pax || 0,

      time: booking?.catering?.schedule,

      label: "Catering",

      accentClassName: "border-l-2 border-l-rose-500",

      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        booking?.venue?.item?.address,
      address: booking?.catering?.venue?.address,

      mainDishes: booking?.catering?.mainDishes || [],

      sideDishes: booking?.catering?.sideDishes || [],

      inclusions: booking?.catering?.inclusions || [],

      pricing: booking?.pricing?.catering,
    });
  }

  if (rows.length === 0) {
    rows.push({
      type: "booking",

      icon: Sparkles,

      iconClassName: "text-muted-foreground",

      name: "Booking details",

      subtitle: "No service details available",

      pax: 0,

      time: {},

      label: "Booking",

      accentClassName: "border-l-2 border-l-muted-foreground",

      location: "-",

      inclusions: [],

      pricing: null,
    });
  }

  return rows;
};

export const getPaymentSummary = (booking) => {
  const total =
    Number(booking?.pricing?.total || 0) ||
    Number(booking?.pricing?.catering?.total || 0) +
      Number(booking?.pricing?.venue?.total || 0) ||
    Number(booking?.meta?.amount || 0);

  const received = Number(
    booking?.payment?.amount || booking?.payment?.received || 0,
  );

  return {
    total,

    received,

    balance: Math.max(total - received, 0),

    status:
      booking?.payment?.status ||
      (received >= total && total > 0
        ? "paid"
        : received > 0
          ? "partial"
          : "unpaid"),
  };
};

export const getTotalPax = (booking) => {
  if (booking.bookingType === "both") {
    return Math.max(
      Number(booking?.catering?.pax || 0),
      Number(booking?.venue?.pax || 0),
    );
  }

  return Number(booking?.[booking.bookingType]?.pax || 0);
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

export const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

/*
|--------------------------------------------------------------------------
| FORMAT ITEM NAME
|--------------------------------------------------------------------------
*/

export const formatItemName = (item) => {
  if (!item) return "-";

  if (typeof item === "string") {
    return item;
  }

  return item.name || item.title || item.description || "-";
};

/*
|--------------------------------------------------------------------------
| CAPITALIZE LABEL
|--------------------------------------------------------------------------
*/

export const capitalizeLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const requiresResourceInput = (inclusion) => {
  if (inclusion.model == "Services") return false;
  const unit = getResourceRequirement(inclusion);

  return ["qty", "hrs"].includes(unit);
};
export const getResourceUnit = (inclusion) => {
  if (inclusion?.model === "Equipment" && inclusion?.item?.unit) {
    return inclusion.item.unit;
  }

  const unit = getResourceRequirement(inclusion);

  return unit === "none" ? "Qty" : unit;
};

export const getResourceRequirement = (inclusion) =>
  String(
    inclusion?.unit ||
      inclusion?.item?.requirement ||
      (inclusion?.model === "Equipment" ? "qty" : "none"),
  ).toLowerCase();

export const buildInclusions = (inclusions) =>
  inclusions.map((inc) => ({ ...inc, item: inc?.item?._id }));

export const getConflictingVenues = (booking, bookings = [], mode = "view") => {
  const defaultResult = {
    hasConflicts: false,
    conflicts: [],
    totalConflicts: 0,
  };

  if (!["venue", "both"].includes(booking?.bookingType) || mode === "view") {
    return defaultResult;
  }

  const { startAt, endAt } = booking?.venue?.schedule || {};

  if (!startAt || !endAt) {
    return defaultResult;
  }

  const pendingStart = new Date(startAt).getTime();
  const pendingEnd = new Date(endAt).getTime();

  if (
    !Number.isFinite(pendingStart) ||
    !Number.isFinite(pendingEnd) ||
    pendingStart >= pendingEnd
  ) {
    return defaultResult;
  }

  const conflicts = bookings
    .filter((existingBooking) => {
      if (!["venue", "both"].includes(existingBooking?.bookingType)) {
        return false;
      }

      // Don't compare the booking with itself.
      if (
        booking?._id &&
        existingBooking?._id &&
        String(booking._id) === String(existingBooking._id)
      ) {
        return false;
      }

      const existingSchedule = existingBooking?.venue?.schedule;

      if (!existingSchedule?.startAt || !existingSchedule?.endAt) {
        return false;
      }

      const existingStart = new Date(existingSchedule.startAt).getTime();
      const existingEnd = new Date(existingSchedule.endAt).getTime();

      if (
        !Number.isFinite(existingStart) ||
        !Number.isFinite(existingEnd) ||
        existingStart >= existingEnd
      ) {
        return false;
      }

      // Two schedules conflict when their time ranges overlap.
      return existingStart < pendingEnd && existingEnd > pendingStart;
    })
    .map((existingBooking) => {
      const existingStart = new Date(
        existingBooking?.venue?.schedule?.startAt,
      ).getTime();

      const existingEnd = new Date(
        existingBooking?.venue.schedule?.endAt,
      ).getTime();

      return {
        ...existingBooking,
        overlap: {
          startAt: new Date(Math.max(existingStart, pendingStart)),
          endAt: new Date(Math.min(existingEnd, pendingEnd)),
        },
      };
    });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    totalConflicts: conflicts.length,
  };
};

export const hasCateringVenueOverlap = (booking) => {
  const { catering, venue, bookingType } = booking;
  if (bookingType !== "both") return false;
  return (
    venue?.schedule?.startAt < catering?.schedule?.endAt &&
    venue.schedule?.endAt > catering.schedule?.startAt
  );
};

export const getEquipmentAllocations = (booking = {}) => {
  const getEquipments = (inclusions = []) =>
    (inclusions || []).filter(({ model }) => model === "Equipment");

  const { bookingType, catering = {}, venue = {} } = booking || {};

  const equipmentMap = {
    venue: getEquipments(venue?.inclusions),
    catering: getEquipments(catering?.inclusions),
  };

  if (bookingType !== "both") {
    return (equipmentMap[bookingType] || []).map((equipment) => ({
      ...equipment,
      source: bookingType,
      label: capitalize(bookingType),
    }));
  }

  const venueEquipmentIds = new Set(
    equipmentMap.venue.map(({ item }) => String(item?._id)),
  );

  const cateringEquipmentIds = new Set(
    equipmentMap.catering.map(({ item }) => String(item?._id)),
  );

  const venueEquipments = equipmentMap.venue.map((equipment) => {
    const isShared = cateringEquipmentIds.has(String(equipment?.item?._id));

    return {
      ...equipment,
      source: "venue",
      label: isShared ? "Venue + Catering" : "Venue",
    };
  });

  const cateringEquipments = equipmentMap.catering
    .filter(({ item }) => !venueEquipmentIds.has(String(item?._id)))
    .map((equipment) => ({
      ...equipment,
      source: "catering",
      label: "Catering",
    }));

  return [...venueEquipments, ...cateringEquipments];
};
