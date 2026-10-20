import {
  eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, eachYearOfInterval,
  endOfDay, endOfMonth, endOfWeek, endOfYear, format, isValid, startOfDay, startOfMonth, startOfWeek, startOfYear,
} from "date-fns";

export const TIMEZONE = "Asia/Manila";

export const manilaDate = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(parsed);
  const part = (type) => Number(parts.find((entry) => entry.type === type).value);
  return new Date(part("year"), part("month") - 1, part("day"));
};

export const getPeriodRange = (period, now = new Date()) => {
  const today = manilaDate(now);
  const from = period === "year" ? startOfYear(today)
    : period === "month" ? startOfMonth(today) : startOfWeek(today, { weekStartsOn: 1 });
  const to = period === "year" ? endOfYear(today)
    : period === "month" ? endOfMonth(today) : endOfWeek(today, { weekStartsOn: 1 });
  return {
    start: from, end: to,
    startDate: format(from, "yyyy-MM-dd"), endDate: format(to, "yyyy-MM-dd"),
    frequency: period === "year" ? "monthly" : period === "month" ? "weekly" : "daily",
    label: period === "year" ? format(from, "yyyy") : period === "month"
      ? format(from, "MMMM yyyy") : `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`,
  };
};

export const getCustomDateRange = ({ from, to } = {}) => {
  if (!isValid(from) || !isValid(to)) return null;
  const start = startOfDay(from);
  const end = endOfDay(to);
  if (start > end) return null;
  return {
    start, end,
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
    frequency: "daily",
    label: `${format(start, start.getFullYear() === end.getFullYear() ? "MMM d" : "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`,
  };
};

export const getCollectionRange = (parentRange, frequency) => ({
  ...parentRange,
  frequency: { week: "weekly", month: "monthly", year: "yearly" }[frequency],
});

export const buildCollectionSeries = (overview, range) => {
  const buckets = range.frequency === "yearly" ? eachYearOfInterval(range)
    : range.frequency === "monthly" ? eachMonthOfInterval(range)
    : range.frequency === "weekly" ? eachWeekOfInterval(range, { weekStartsOn: 1 })
      : eachDayOfInterval(range);
  const values = new Map((overview || []).map((entry) => {
    const date = manilaDate(entry.period);
    return [date ? format(date, "yyyy-MM-dd") : "", entry];
  }));
  return buckets.map((date) => {
    const entry = values.get(format(date, "yyyy-MM-dd"));
    return {
      date: format(date, range.frequency === "yearly" ? "yyyy" : range.frequency === "monthly" ? "MMM" : range.frequency === "weekly" ? "MMM d" : "EEE"),
      booking: Number(entry?.booking ?? 0), pos: Number(entry?.pos ?? 0),
    };
  });
};

export const formatManila = (value, options) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, ...options }).format(date) : "—";
};

export const mapBooking = (booking) => ({
  id: booking._id,
  event: booking.eventType || booking.reference || "Booking",
  service: { both: "Venue + Catering", venue: "Venue", catering: "Catering" }[booking.bookingType] || "Booking",
  day: formatManila(booking.upcomingDate, { day: "2-digit" }),
  month: formatManila(booking.upcomingDate, { month: "short" }).toUpperCase(),
  time: formatManila(booking.upcomingDate, { hour: "numeric", minute: "2-digit", hour12: true }),
  guests: booking.guests ?? null,
  status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Unknown",
});

export const mapInventoryItem = (item) => {
  const factor = ["weight", "volume"].includes(item.measurement) ? 1000 : 1;
  return {
    id: item._id, name: item.name,
    quantity: Number(item.currentStock ?? 0) / factor,
    reorder: Number(item.minimumStock ?? 0),
    unit: { weight: "kg", volume: "L", pieces: "pcs" }[item.measurement] || item.baseUnit || "",
  };
};

export const mapDelivery = (delivery) => ({
  id: delivery._id,
  reference: delivery._id ? String(delivery._id).slice(-8).toUpperCase() : "—",
  supplier: delivery.supplier?.name || "Unknown supplier",
  expected: formatManila(delivery.deliveryWindow?.from, { month: "short", day: "numeric", year: "numeric" }),
  status: delivery.status === "redelivery" ? "Re-delivery" : "Incoming",
  amount: Number(delivery.totalAmount ?? 0),
});
