import { describe, expect, it } from "vitest";
import { formatAnalytics } from "./data";

describe("live booking analytics formatting", () => {
  it("maps summary and rankings, formats customer names, and fills empty months", () => {
    const data = formatAnalytics({
      summary: { totalBookings: 8, totalBookingValue: 80000, averageBookingValue: 10000 },
      trends: [{ date: "2026-01-31T16:00:00.000Z", bookings: 8, value: 80000 }],
      customers: [{ _id: "customer", name: { fname: "Ana", lname: "Cruz" }, bookings: 8, percentage: 100 }],
      packages: [{ _id: "package", name: "Wedding", bookings: 8, percentage: 100 }],
    }, { from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) });
    expect(data.total).toBe(8);
    expect(data.value).toBe(80000);
    expect(data.average).toBe(10000);
    expect(data.monthly.map((row) => row.bookings)).toEqual([0, 8, 0]);
    expect(data.monthly[1].tooltipLabel).toBe("Feb 2026");
    expect(data.customers[0].name).toBe("Cruz, Ana");
    expect(data.packages[0].name).toBe("Wedding");
  });

  it("handles an empty response and separates calendar years", () => {
    const data = formatAnalytics(undefined, { from: new Date(2025, 11, 1), to: new Date(2026, 0, 31) });
    expect(data.total).toBe(0);
    expect(data.average).toBe(0);
    expect(data.packages).toEqual([]);
    expect(data.venues).toEqual([]);
    expect(data.monthly.map((row) => row.month)).toEqual(["Dec 2025", "Jan 2026"]);
    expect(data.monthly.every((row) => row.bookings === 0 && row.value === 0)).toBe(true);
  });
});
