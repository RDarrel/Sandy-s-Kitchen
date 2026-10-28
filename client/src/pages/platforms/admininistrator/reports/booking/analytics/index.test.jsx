import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { endOfMonth, format, startOfYear } from "date-fns";
import reducer, { GET_ANALYTICS } from "@/services/redux/slices/report/booking";
import Analytics from "./index";

const { universal, exportAnalytics } = vi.hoisted(() => ({ universal: vi.fn(), exportAnalytics: vi.fn() }));
vi.mock("@/services/utilities/export/excel/bookingAnalyticsToExcel", () => ({ default: exportAnalytics }));
vi.mock("@/services/utilities", () => ({ axioKit: { universal } }));
vi.mock("./chart", () => ({ default: () => <div>Booking chart</div> }));
vi.mock("@/components/shared/datePicker", () => ({
  default: ({ mode, captionLayout, setDate }) => <button onClick={() => setDate({ from: new Date(2026, 1, 1), to: new Date(2026, 1, 28) })}>
    {mode} {captionLayout}
  </button>,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const createStore = () => configureStore({ reducer: { bookingReport: reducer } });

describe("Booking Analytics API wiring", () => {
  it("shows the skeleton while fetching, keeps the date picker available, and replaces it after loading", async () => {
    let resolve;
    universal.mockReturnValue(new Promise((complete) => { resolve = complete; }));
    render(<Provider store={createStore()}><Analytics /></Provider>);
    expect(screen.getByRole("status", { name: "Loading booking analytics" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "range dropdown" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Export to Excel" })).toBeDisabled();
    expect(screen.queryByText("No bookings")).not.toBeInTheDocument();
    expect(screen.queryByText("Booking chart")).not.toBeInTheDocument();
    await act(async () => {
      resolve({ data: { summary: {}, trends: [], packages: [], venues: [], dishes: [], customers: [] } });
    });
    expect(screen.queryByRole("status", { name: "Loading booking analytics" })).not.toBeInTheDocument();
    expect(screen.getByText("Booking chart")).toBeInTheDocument();
  });

  it("requests the default dates, displays live rankings, and refetches the selected range", async () => {
    universal.mockResolvedValue({ data: {
      summary: { totalBookings: 7, totalBookingValue: 14000, averageBookingValue: 2000 },
      trends: [],
      packages: [{ _id: "pkg", name: "Live catering package", bookings: 7, value: 14000, percentage: 100 }],
      venues: [], dishes: [], customers: [],
    } });
    const store = createStore();
    render(<Provider store={store}><Analytics /></Provider>);
    await waitFor(() => expect(screen.getAllByText("Live catering package")).toHaveLength(2));
    const today = new Date();
    expect(universal).toHaveBeenCalledWith("reports/booking/analytics", {
      startDate: format(startOfYear(today), "yyyy-MM-dd"),
      endDate: format(endOfMonth(today), "yyyy-MM-dd"),
    }, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole("button", { name: "Booking Value" }));
    fireEvent.click(screen.getByRole("button", { name: "Export to Excel" }));
    await waitFor(() => expect(exportAnalytics).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ total: 7, value: 14000 }),
      options: expect.objectContaining({ metric: "value", createdBy: "Administrator" }),
    })));
    fireEvent.click(screen.getByRole("button", { name: "range dropdown" }));
    await waitFor(() => expect(universal).toHaveBeenLastCalledWith("reports/booking/analytics", {
      startDate: "2026-02-01", endDate: "2026-02-28",
    }, expect.any(AbortSignal)));
  });

  it("shows request errors and disables exporting failed results", async () => {
    universal.mockRejectedValue(new Error("Analytics unavailable"));
    render(<Provider store={createStore()}><Analytics /></Provider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Analytics unavailable");
    expect(screen.getByRole("button", { name: "Export to Excel" })).toBeDisabled();
  });

  it("ignores an older response after a newer range request starts", () => {
    let state = reducer(undefined, GET_ANALYTICS.pending("old", {}));
    state = reducer(state, GET_ANALYTICS.pending("new", {}));
    state = reducer(state, GET_ANALYTICS.fulfilled({ data: { summary: { totalBookings: 99 } } }, "old", {}));
    expect(state.analytics.summary).toEqual({});
    expect(state.analyticsRequestId).toBe("new");
    state = reducer(state, GET_ANALYTICS.fulfilled({ data: { summary: { totalBookings: 7 } } }, "new", {}));
    expect(state.analytics.summary.totalBookings).toBe(7);
    expect(state.analyticsRequestId).toBeNull();
  });
});
