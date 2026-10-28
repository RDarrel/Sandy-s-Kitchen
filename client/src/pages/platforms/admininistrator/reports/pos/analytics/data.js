import { eachMonthOfInterval, format, isSameYear } from "date-fns";
import { TZDate } from "@date-fns/tz";

export const money = (value, digits = 2) => new Intl.NumberFormat("en-PH", {
  style: "currency", currency: "PHP", minimumFractionDigits: digits, maximumFractionDigits: digits,
}).format(value);
export const compactMoney = (value) => `₱${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

export function formatAnalytics(payload, range) {
  const { summary = {}, trends = [], dishes = [], categories = [] } = payload?.analytics ?? payload ?? {};
  const groups = new Map(trends.map((trend) => [format(new TZDate(trend.date, "Asia/Manila"), "yyyy-MM"), trend]));
  return {
    totalSales: summary.totalSales ?? 0,
    totalOrders: summary.totalOrders ?? 0,
    averageOrderValue: summary.averageOrderValue ?? 0,
    bestSellingDish: summary.bestSellingDish ?? dishes[0] ?? null,
    monthly: eachMonthOfInterval({ start: range.from, end: range.to }).map((month) => {
      const trend = groups.get(format(month, "yyyy-MM"));
      return {
        month: format(month, isSameYear(range.from, range.to) ? "MMM" : "MMM yyyy"),
        tooltipLabel: format(month, "MMM yyyy"),
        orders: trend?.orders ?? 0,
        value: trend?.value ?? 0,
      };
    }),
    dishes, categories,
  };
}
