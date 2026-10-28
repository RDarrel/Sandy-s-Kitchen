import { eachMonthOfInterval, format, isSameYear } from "date-fns";
import { TZDate } from "@date-fns/tz";
import fullName from "@/services/utilities/fullName";

export const money = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
export const compactMoney = (value) => `₱${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

// Adapt the API response to the existing cards/chart, including zero-booking months.
export function formatAnalytics(analytics, range) {
  const { summary = {}, trends = [] } = analytics || {};
  const groups = new Map(trends.map((trend) => [
    format(new TZDate(trend.date, "Asia/Manila"), "yyyy-MM"), trend,
  ]));
  const rankings = Object.fromEntries(["packages", "venues", "dishes", "customers"].map((key) => [
    key,
    (analytics?.[key] || []).map((row) => ({
      ...row,
      name: typeof row.name === "object" && row.name ? fullName(row.name) : row.name,
    })),
  ]));
  return {
    total: summary.totalBookings || 0,
    value: summary.totalBookingValue || 0,
    average: summary.averageBookingValue || 0,
    monthly: eachMonthOfInterval({ start: range.from, end: range.to }).map((month) => {
      const trend = groups.get(format(month, "yyyy-MM"));
      return {
        month: format(month, isSameYear(range.from, range.to) ? "MMM" : "MMM yyyy"),
        tooltipLabel: format(month, "MMM yyyy"),
        bookings: trend?.bookings || 0,
        value: trend?.value || 0,
      };
    }),
    ...rankings,
  };
}
