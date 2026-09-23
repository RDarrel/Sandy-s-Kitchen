import { Formatter } from "@/services/utilities";
import { Building2, Sparkles, Utensils } from "lucide-react";
export const getServiceRows = (booking) => {
  const rows = [];

  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    rows.push({
      type: "catering",

      icon: Utensils,

      iconClassName: "text-rose-700",

      name: booking?.catering?.item?.name || "Catering package",

      subtitle: "Food service",

      pax: booking?.catering?.pax || 0,

      time: booking?.catering?.time,

      label: "Catering",

      accentClassName: "border-l-2 border-l-rose-500",

      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        booking?.venue?.item?.address,

      mainDishes: booking?.catering?.mainDishes || [],

      sideDishes: booking?.catering?.sideDishes || [],

      inclusions: booking?.catering?.item?.inclusions || [],

      pricing: booking?.pricing?.catering,
    });
  }

  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    rows.push({
      type: "venue",

      icon: Building2,

      iconClassName: "text-amber-700",

      name: booking?.venue?.item?.name || "Venue reservation",

      subtitle: booking?.venue?.item?.setting || "Event venue",

      pax: booking?.venue?.pax || 0,

      time: booking?.venue?.time,

      label: "Venue",

      accentClassName: "border-l-2 border-l-amber-500",

      location: booking?.venue?.item?.address,

      inclusions: booking?.venue?.item?.inclusions || [],

      pricing: booking?.pricing?.venue,
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
  const total = Number(booking?.pricing?.total || 0);

  const received = Number(booking?.payment?.amount || 0);

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
