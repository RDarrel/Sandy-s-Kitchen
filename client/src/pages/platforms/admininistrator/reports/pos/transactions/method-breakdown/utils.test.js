import { describe, expect, it } from "vitest";
import { getMethodBreakdown } from "./utils";

describe("POS payment breakdown", () => {
  const methods = [
    { _id: "bdo", name: "BDO", type: "bank_transfer", methodImgId: "logo" },
    { _id: "cash", name: "Cash", type: "cash" },
    { _id: "wallet", name: "GCash", type: "e_wallet" },
  ];

  it("groups populated and raw method IDs and excludes cash change", () => {
    const result = getMethodBreakdown([
      { method: { _id: "bdo", name: "BDO" }, amount: 400 },
      { method: "bdo", amount: 200 },
      { method: "cash", amount: 400, cash: 1000 },
    ], methods);

    expect(result.total).toBe(1000);
    expect(result.count).toBe(3);
    expect(result.breakdown).toEqual([
      expect.objectContaining({ _id: "bdo", amount: 600, count: 2, share: 60, methodImgId: "logo" }),
      expect.objectContaining({ _id: "cash", amount: 400, count: 1, share: 40 }),
      expect.objectContaining({ _id: "wallet", amount: 0, count: 0, share: 0 }),
    ]);
  });

  it("keeps missing and unlisted methods in the totals", () => {
    const result = getMethodBreakdown([
      { method: null, amount: 100 },
      { amount: 50 },
      { method: { _id: "old", name: "Old bank", type: "bank_transfer" }, amount: 250 },
    ]);

    expect(result.total).toBe(400);
    expect(result.breakdown).toEqual([
      expect.objectContaining({ name: "Old bank", amount: 250, count: 1 }),
      expect.objectContaining({ name: "Unspecified method", amount: 150, count: 2 }),
    ]);
  });

  it("returns zero shares for a period without payments", () => {
    const result = getMethodBreakdown([], methods);
    expect(result.total).toBe(0);
    expect(result.count).toBe(0);
    expect(result.breakdown.every(({ share, amount }) => share === 0 && amount === 0)).toBe(true);
  });

  it("calculates totals from the supplied filtered transactions", () => {
    const transactions = [
      { method: "bdo", amount: 100, cashier: "a" },
      { method: "bdo", amount: 300, cashier: "b" },
    ];
    const result = getMethodBreakdown(transactions.filter(({ cashier }) => cashier === "a"), methods);
    expect(result.total).toBe(100);
    expect(result.breakdown[0]).toMatchObject({ _id: "bdo", count: 1, share: 100 });
  });
});
