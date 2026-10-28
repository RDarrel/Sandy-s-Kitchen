import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { endOfMonth, format, startOfYear } from "date-fns";
import reducer from "@/services/redux/slices/report/pos";
import Analytics from "./index";
import { formatAnalytics } from "./data";

const { universal, exportAnalytics } = vi.hoisted(() => ({ universal: vi.fn(), exportAnalytics: vi.fn() }));
vi.mock("@/services/utilities", () => ({ axioKit: { universal } }));
vi.mock("@/services/utilities/export/excel/posAnalyticsToExcel", () => ({ default: exportAnalytics }));
vi.mock("./chart", () => ({ default: ({ metric }) => <div>Chart metric: {metric}</div> }));
vi.mock("@/components/shared/datePicker", () => ({ default: ({ mode, captionLayout, setDate }) => <button onClick={() => setDate({ from: new Date(2026, 1, 1), to: new Date(2026, 1, 28) })}>{mode} {captionLayout}</button> }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const data = { analytics: {
  summary: { totalSales: 4909, totalOrders: 14, averageOrderValue: 4909 / 14, bestSellingDish: { name: "Crispy Pata", unitsSold: 8 } },
  trends: [{ date: "2026-01-31T16:00:00Z", orders: 14, value: 4909 }],
  dishes: [{ _id: "dish", name: "Crispy Pata", unitsSold: 8, value: 2400, percentage: 2400 / 4909 * 100 }],
  categories: [{ _id: "category", name: "Main Dishes", unitsSold: 12, value: 4909, percentage: 100 }],
} };
const mount = () => render(<Provider store={configureStore({ reducer: { posReport: reducer } })}><Analytics /></Provider>);

it("maps the nested backend response and fills empty months using Manila dates", () => {
  const result = formatAnalytics(data, { from: new Date(2026, 0, 1), to: new Date(2026, 2, 31) });
  expect(result.monthly.map((month) => month.orders)).toEqual([0, 14, 0]);
  expect(result.totalSales).toBe(4909);
  expect(result.bestSellingDish.name).toBe("Crispy Pata");
  const empty = formatAnalytics(undefined, { from: new Date(2026, 0, 1), to: new Date(2026, 0, 31) });
  expect(empty.totalSales).toBe(0);
  expect(empty.bestSellingDish).toBeNull();
});

it("renders the requested cards and two rankings, filters dates, and exports the selected metric", async () => {
  universal.mockResolvedValue({ data });
  mount();
  await waitFor(() => expect(screen.getAllByText("Crispy Pata")).toHaveLength(2));
  expect(screen.getByText("₱4,909")).toBeInTheDocument();
  expect(screen.getByText("₱350.64")).toBeInTheDocument();
  expect(screen.getByText("8 units sold")).toBeInTheDocument();
  expect(screen.getByText("Based on 14 POS orders")).toBeInTheDocument();
  expect(screen.getAllByRole("table")).toHaveLength(2);
  expect(screen.getByText("Sales by Category")).toBeInTheDocument();
  const today = new Date();
  expect(universal).toHaveBeenCalledWith("reports/pos/analytics", {
    startDate: format(startOfYear(today), "yyyy-MM-dd"), endDate: format(endOfMonth(today), "yyyy-MM-dd"),
  }, expect.any(AbortSignal));
  fireEvent.click(screen.getByRole("button", { name: "Orders" }));
  expect(screen.getByText("Chart metric: orders")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Export to Excel" }));
  await waitFor(() => expect(exportAnalytics).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ totalOrders: 14 }), options: expect.objectContaining({ metric: "orders" }) })));
  fireEvent.click(screen.getByRole("button", { name: "range dropdown" }));
  await waitFor(() => expect(universal).toHaveBeenLastCalledWith("reports/pos/analytics", { startDate: "2026-02-01", endDate: "2026-02-28" }, expect.any(AbortSignal)));
});

it("shows a POS skeleton during loading and then shows an empty report", async () => {
  let resolve;
  universal.mockReturnValue(new Promise((complete) => { resolve = complete; }));
  mount();
  expect(screen.getByRole("status", { name: "Loading POS analytics" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export to Excel" })).toBeDisabled();
  await act(async () => { resolve({ data: { analytics: {} } }); });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getAllByText("No POS sales in the selected period.")).toHaveLength(2);
});

it("shows API errors without allowing an export", async () => {
  universal.mockRejectedValue(new Error("Unable to load POS analytics"));
  mount();
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load POS analytics");
  expect(screen.getByRole("button", { name: "Export to Excel" })).toBeDisabled();
});
