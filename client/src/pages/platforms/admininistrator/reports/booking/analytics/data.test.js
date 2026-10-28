import { describe, expect, it } from "vitest";
import { getAnalytics } from "./data";

describe("booking analytics date range", () => {
  it("includes both boundary days and filters individual days within a month", () => {
    const data = getAnalytics({ from: new Date(2026, 0, 3), to: new Date(2026, 0, 6) });
    expect(data.total).toBe(4);
    expect(data.monthly[0].bookings).toBe(4);
    expect(data.packages.reduce((sum, row) => sum + row.bookings, 0)).toBe(4);
    expect(data.monthly[0].value).toBe(data.value);
  });

  it("keeps the existing January through October sample totals", () => {
    const data = getAnalytics({ from: new Date(2026, 0, 1), to: new Date(2026, 9, 31) });
    expect(data.total).toBe(226);
    expect(data.monthly).toHaveLength(10);
    expect(data.monthly[9].bookings).toBe(27);
    expect(data.monthly.reduce((sum, month) => sum + month.value, 0)).toBe(data.value);
  });

  it("separates years and returns empty rankings for dates without sample bookings", () => {
    const empty = getAnalytics({ from: new Date(2025, 0, 1), to: new Date(2025, 0, 31) });
    expect(empty.total).toBe(0);
    expect(empty.value).toBe(0);
    expect(empty.packages).toEqual([]);
    expect(empty.venues).toEqual([]);

    const data = getAnalytics({ from: new Date(2025, 0, 1), to: new Date(2026, 0, 31) });
    expect(data.monthly).toHaveLength(13);
    expect(data.monthly[0]).toMatchObject({ month: "Jan 2025", bookings: 0 });
    expect(data.monthly[12]).toMatchObject({ month: "Jan 2026", bookings: 12 });
  });
});
