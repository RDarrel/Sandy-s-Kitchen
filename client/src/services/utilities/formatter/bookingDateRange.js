import { format, isSameDay, isSameYear, isValid } from "date-fns";

const bookingDateRange = (schedule) => {
  const { startAt, endAt } = schedule || {};

  if (!startAt || !endAt) return "—";

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!isValid(start) || !isValid(end)) return "—";

  const now = new Date();

  const startFormat = isSameYear(start, now) ? "MMM d" : "MMM d, yyyy";

  const endFormat = isSameYear(end, now) ? "MMM d" : "MMM d, yyyy";

  if (isSameDay(start, end)) {
    return `${format(start, startFormat)} · ${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
  }

  return `${format(start, `${startFormat}, h:mm a`)} – ${format(end, `${endFormat}, h:mm a`)}`;
};

export default bookingDateRange;
