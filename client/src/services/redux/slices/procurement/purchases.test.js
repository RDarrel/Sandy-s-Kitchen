import { describe, expect, it, vi } from "vitest";

vi.mock("../../../utilities", async () => ({
  axioKit: {},
  Stock: {},
  Formatter: {
    batchNumber: (await import("../../../utilities/formatter/batchNumber.jsx")).default,
  },
}));

import reducer, { SEARCH } from "./purchases";

const collections = [
  { _id: "1234567890abcdef12ab34cd", supplier: { name: "Fresh Market" } },
  { _id: "1234567890abcdef1256ef78", supplier: { name: "Daily Supplies" } },
  { _id: "1234567890abcdef1290ab12" },
  { supplier: {} },
];

describe("purchase search", () => {
  it.each([
    ["B-AB34CD", [collections[0]]],
    [" b-ab34cd ", [collections[0]]],
    ["34cd", [collections[0]]],
    ["FRESH", [collections[0]]],
    ["B-90AB12", [collections[2]]],
    ["no match", []],
    ["   ", collections],
  ])("finds supplier orders using %j", (query, expected) => {
    const initialState = reducer(undefined, { type: "init" });
    const state = reducer({ ...initialState, collections }, SEARCH(query));

    expect(state.filtered).toEqual(expected);
    expect(state.collections).toEqual(collections);
  });
});
