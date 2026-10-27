import { describe, expect, it } from "vitest";
import { groupPaymentRows, paymentGroupLabel, paymentGroupTotals } from "./grouping";

describe("booking transaction period rows", () => {
  it("totals all matching rows in a period across pages using displayed refund signs", () => {
    const rows = [
      { periodDate: "2026-10-26", amount: "1000", status: "verified" },
      { periodDate: "2026-10-26", amount: 200, transactionType: "refund", status: "completed" },
      { periodDate: "2026-10-26", amount: 300, status: "pending" },
      { periodDate: "2026-10-25", amount: 500, status: "verified" },
    ];
    const totals = paymentGroupTotals(rows);
    const page = groupPaymentRows(rows.slice(1, 2));
    expect(totals.get(page[0].date)).toBe(1100);
    expect(totals.get("2026-10-25")).toBe(500);
    expect(paymentGroupTotals(rows.filter((row) => row.status === "verified")).get("2026-10-26")).toBe(1000);
    expect(paymentGroupTotals([]).size).toBe(0);
  });
  it("labels Manila dates and Monday-to-Sunday weeks like POS Sales", () => {
    const date = "2026-10-25T16:00:00.000Z";
    expect(paymentGroupLabel(date, "daily", 1)).toBe("October 26, 2026");
    expect(paymentGroupLabel(date, "weekly", 2)).toBe("Week 2 (October 26, 2026 to November 1, 2026)");
    expect(paymentGroupLabel(date, "monthly", 1)).toBe("October 2026");
    expect(paymentGroupLabel(date, "yearly", 1)).toBe("2026");
  });

  it("repeats the group heading on a page starting midway through a period", () => {
    const rows = [
      { _id: "1", periodDate: "2026-10-26", weekNumber: 2 },
      { _id: "2", periodDate: "2026-10-26", weekNumber: 2 },
      { _id: "3", periodDate: "2026-10-25", weekNumber: 1 },
    ];
    const page = groupPaymentRows(rows.slice(1));
    expect(page.map((group) => group.date)).toEqual(["2026-10-26", "2026-10-25"]);
    expect(page[0].items.map((payment) => payment._id)).toEqual(["2"]);
    expect(groupPaymentRows(rows)[0].items).toHaveLength(2);
    expect(groupPaymentRows([])).toEqual([]);
  });
});
