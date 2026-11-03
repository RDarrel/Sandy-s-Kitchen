import { describe, expect, it, vi } from "vitest";

vi.mock("../../../utilities", () => ({ axioKit: {} }));

import reducer, {
  BROWSE,
  FilterBY_AVAILABLE_FOR,
  FilterBY_AVAILABILITY,
  FilterBY_CATEGORY,
  SEARCH,
  SetNEW_MENU,
  SetUPDATED_MENU,
  selectMenuCategoryCounts,
} from "./menus";

const collections = [
  { _id: "1", name: "Chicken", category: "main", availableFor: "dine_in", isAvailable: true },
  { _id: "2", name: "Chicken Tray", category: "main", availableFor: "catering", isAvailable: true },
  { _id: "3", name: "Salad", category: "side", availableFor: "both", isAvailable: false },
  { _id: "4", name: "Rice", category: "side", isAvailable: true },
];

const load = () => reducer(undefined, BROWSE.fulfilled({ payload: collections }));

describe("menu available-for filter", () => {
  it("counts categories using service and availability filters across all categories", () => {
    let state = reducer(load(), FilterBY_AVAILABLE_FOR("catering"));
    state = reducer(state, FilterBY_CATEGORY("main"));
    state = reducer(state, SEARCH("Chicken"));
    expect(selectMenuCategoryCounts({ menus: state })).toEqual({ main: 1, side: 2 });
    state = reducer(state, FilterBY_AVAILABILITY("available"));
    expect(selectMenuCategoryCounts({ menus: state })).toEqual({ main: 1, side: 1 });
    state = reducer(state, FilterBY_AVAILABLE_FOR("all"));
    expect(selectMenuCategoryCounts({ menus: state })).toEqual({ main: 2, side: 1 });
  });
  it.each([
    ["all", ["1", "2", "3", "4"]],
    ["dine_in", ["1", "3", "4"]],
    ["catering", ["2", "3", "4"]],
  ])("filters %s and defaults older items to both", (value, ids) => {
    const state = reducer(load(), FilterBY_AVAILABLE_FOR(value));
    expect(state.filtered.map((item) => item._id)).toEqual(ids);
    expect(state.collections).toEqual(collections);
  });

  it("combines with search, category, availability, and refreshed data", () => {
    let state = reducer(load(), SEARCH("Chicken"));
    state = reducer(state, FilterBY_AVAILABLE_FOR("catering"));
    expect(state.search).toBe("Chicken");
    expect(state.filtered).toEqual([collections[1]]);
    state = reducer(state, FilterBY_CATEGORY("main"));
    state = reducer(state, FilterBY_AVAILABILITY("available"));
    state = reducer(state, SEARCH("Tray"));
    state = reducer(state, BROWSE.fulfilled({ payload: collections }));
    expect(state.filtered).toEqual([collections[1]]);
    state = reducer(state, FilterBY_AVAILABILITY("unavailable"));
    expect(state.filtered).toEqual([]);
    state = reducer(state, FilterBY_CATEGORY("side"));
    expect(state.filtered).toEqual([collections[2]]);
  });

  it("keeps new and edited items consistent with the active filter", () => {
    let state = reducer(load(), FilterBY_AVAILABLE_FOR("catering"));
    state = reducer(state, SetNEW_MENU({ ...collections[0], _id: "5" }));
    expect(state.filtered).toEqual([collections[1], collections[2], collections[3]]);
    state = reducer(state, SetUPDATED_MENU({ ...collections[1], availableFor: "dine_in" }));
    expect(state.filtered).toEqual([collections[2], collections[3]]);
    state = reducer(state, SetUPDATED_MENU({ ...collections[0], availableFor: "catering" }));
    expect(state.filtered).toEqual([
      { ...collections[0], availableFor: "catering" },
      collections[2],
      collections[3],
    ]);
    expect(state.cluster).toEqual(state.filtered);
  });
});
