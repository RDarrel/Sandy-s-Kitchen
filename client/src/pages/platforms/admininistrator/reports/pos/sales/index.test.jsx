import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import Sales from "./index";

vi.mock("@/services/redux/slices/report/pos", () => ({ GET_SALES_REPORT: (query) => ({ type: "test/report", payload: query }) }));
vi.mock("@/services/utilities/export/excel/posSalesToExcel", () => ({ default: vi.fn() }));
vi.mock("@/components/shared/datePicker", () => ({ default: () => <span>Report dates</span> }));
vi.mock("@/components/shared/pagination", () => ({ default: () => null }));
vi.mock("@/services/utilities", () => ({
  capitalize: (value) => value,
  Formatter: { amount: (value) => String(value ?? 0) },
  fullName: () => "Administrator",
  handlePagination: (rows, page, limit) => rows.slice((page - 1) * limit, page * limit),
}));
afterEach(cleanup);

it("replaces the grouped loading placeholders with an empty state when no sales are returned", () => {
  const store = configureStore({ reducer: {
    auth: () => ({ auth: {} }),
    posReport: (state = { isLoading: true, salesReport: {} }, action) =>
      action.type === "test/empty"
        ? { isLoading: false, salesReport: { summary: {}, salesBreakdown: [] } }
        : state,
  } });
  render(<Provider store={store}><Sales /></Provider>);
  expect(screen.getByText("Loading sales...")).toHaveAttribute("role", "status");
  expect(screen.getAllByRole("columnheader")).toHaveLength(10);
  expect(screen.queryByText("No sales found")).not.toBeInTheDocument();

  act(() => store.dispatch({ type: "test/empty" }));
  expect(screen.queryByText("Loading sales...")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("No sales found");
  expect(screen.getByRole("status")).toHaveTextContent("Try selecting another date range.");
  expect(screen.queryByRole("columnheader")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export to Excel" })).toBeDisabled();
});

it.each(["weekly", "monthly", "yearly"])("omits the date/time column for daily and %s rows", async (frequency) => {
  const originalScroll = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const item = { menu: { _id: "menu", name: "Adobo" }, quantity: 1, amount: 150, totalCost: 50 };
  const store = configureStore({ reducer: {
    auth: () => ({ auth: {} }),
    posReport: (state = { salesReport: {}, isLoading: false }, action) => action.type === "test/report" ? {
      isLoading: false,
      salesReport: { summary: {}, salesBreakdown: [{ date: "2026-09-30T16:00:00Z", items: action.payload.frequency === "daily" ? [
        { ...item, _id: "daily", createdAt: "2026-10-01T02:15:00Z" },
      ] : [
        { ...item, date: "2026-09-30T16:00:00Z" },
        { ...item, date: "2026-10-01T16:00:00Z" },
      ] }] },
    } : state,
  } });
  try {
    render(<Provider store={store}><Sales /></Provider>);
    expect(await screen.findByText("Adobo")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    const trigger = screen.getByRole("combobox", { name: "Frequency" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("option", { name: frequency[0].toUpperCase() + frequency.slice(1) }), { key: "Enter" });
    await waitFor(() => expect(screen.getAllByText("Adobo")).toHaveLength(2));
    const groupRow = screen.getAllByRole("row").find((row) => within(row).queryAllByRole("cell").length === 2);
    expect(within(groupRow).getAllByRole("cell")[1]).toHaveTextContent("300");
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    expect(screen.queryByRole("columnheader", { name: /^(Date|Time)$/ })).not.toBeInTheDocument();
    expect(screen.queryByText("10:15 AM")).not.toBeInTheDocument();
  } finally {
    if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
    else delete HTMLElement.prototype.scrollIntoView;
  }
});

it("shows the full group total even when its items span multiple pages", async () => {
  const report = { salesReport: { summary: {}, salesBreakdown: [{
    date: "2026-09-30T16:00:00Z",
    items: Array.from({ length: 12 }, (_, index) => ({ _id: `sale-${index}`, menu: { name: "Adobo" }, quantity: 1, amount: 100, totalCost: 50 })),
  }] }, isLoading: false };
  const store = configureStore({ reducer: { auth: () => ({ auth: {} }), posReport: (state = report) => state } });
  render(<Provider store={store}><Sales /></Provider>);
  expect(await screen.findAllByText("Adobo")).toHaveLength(10);
  const rows = screen.getAllByRole("row");
  expect(within(rows[0]).getAllByRole("cell")).toHaveLength(2);
  expect(within(rows[0]).getAllByRole("cell")[1]).toHaveTextContent("1200");
  expect(within(rows[1]).getAllByRole("columnheader")).toHaveLength(5);
});
