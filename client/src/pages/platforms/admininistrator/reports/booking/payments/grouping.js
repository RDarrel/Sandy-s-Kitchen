import { addDays, format, isValid } from "date-fns";

export const paymentGroupLabel = (value, frequency, weekNumber) => {
  const parsed = value ? new Date(value) : null;
  if (!isValid(parsed)) return "Unknown date";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(parsed);
  const part = (type) => Number(parts.find((item) => item.type === type).value);
  const date = new Date(part("year"), part("month") - 1, part("day"));
  if (frequency === "weekly") {
    return `Week ${weekNumber} (${format(date, "MMMM d, yyyy")} to ${format(addDays(date, 6), "MMMM d, yyyy")})`;
  }
  if (frequency === "monthly") return format(date, "MMMM yyyy");
  if (frequency === "yearly") return format(date, "yyyy");
  return format(date, "MMMM d, yyyy");
};

export const paginatePaymentGroups = (groups, page, pageSize) => {
  const start = (page - 1) * pageSize;
  const end = start + Number(pageSize);
  let offset = 0;
  return groups.map((group) => {
    const items = group.items.slice(Math.max(0, start - offset), Math.max(0, end - offset));
    offset += group.items.length;
    return { ...group, items };
  }).filter((group) => group.items.length);
};

