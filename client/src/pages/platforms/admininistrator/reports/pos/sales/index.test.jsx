import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  handlePagination: (rows) => rows,
}));
afterEach(cleanup);

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
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
    expect(screen.queryByRole("columnheader", { name: /^(Date|Time)$/ })).not.toBeInTheDocument();
    expect(screen.queryByText("10:15 AM")).not.toBeInTheDocument();
  } finally {
    if (originalScroll) HTMLElement.prototype.scrollIntoView = originalScroll;
    else delete HTMLElement.prototype.scrollIntoView;
  }
});
