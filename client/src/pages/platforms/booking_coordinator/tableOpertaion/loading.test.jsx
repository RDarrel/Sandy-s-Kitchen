import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import TableOperation from "./index";

const { fetchBookings } = vi.hoisted(() => ({ fetchBookings: vi.fn() }));

vi.mock("@/services/redux/slices/events/bookings", async () => {
  const { createAsyncThunk } = await import("@reduxjs/toolkit");
  return {
    BOOKINGS: createAsyncThunk("test/bookings", (query) => fetchBookings(query)),
    COUNTS: () => ({ type: "test/counts" }),
  };
});
vi.mock("./body/filters", () => ({
  default: ({ query, setQuery, setPage }) => (
    <input aria-label="Search bookings" value={query} onChange={(event) => {
      setQuery(event.target.value);
      setPage(1);
    }} />
  ),
}));
vi.mock("./body/booking", () => ({
  default: ({ booking }) => <tr><td>{booking.id}</td></tr>,
}));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((success, failure) => { resolve = success; reject = failure; });
  return { promise, resolve, reject };
};
const result = (reference) => ({ data: {
  bookings: reference ? [{ _id: reference, reference, bookingType: "venue" }] : [],
  pagination: { total: reference ? 10 : 0, totalPages: reference ? 2 : 0 },
} });
const mount = () => {
  const initial = { ...result("CACHED").data, counts: {} };
  const store = configureStore({ reducer: {
    bookings: (state = initial, action) => action.type === "test/bookings/fulfilled"
      ? { ...state, ...action.payload.data }
      : state,
  } });
  render(<Provider store={store}><TableOperation /></Provider>);
  return store;
};
const startRequest = () => act(async () => { await vi.advanceTimersByTimeAsync(250); });

beforeEach(() => { vi.useFakeTimers(); fetchBookings.mockReset(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

it("shows loading instead of cached rows until the current request settles", async () => {
  const request = deferred();
  fetchBookings.mockReturnValue(request.promise);
  mount();
  expect(screen.getByRole("region", { name: "Booking table" })).toHaveAttribute("aria-busy", "true");
  expect(screen.queryByText("CACHED")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Loading bookings...");
  expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  expect(screen.queryByText("No bookings available")).not.toBeInTheDocument();
  await startRequest();
  await act(async () => { request.resolve(result("CURRENT")); });
  expect(screen.getByText("CURRENT")).toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Booking table" })).toHaveAttribute("aria-busy", "false");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Go to next page" })).toBeEnabled();
});

it("keeps loading and ignores stale results when a previous request finishes", async () => {
  const oldRequest = deferred();
  const currentRequest = deferred();
  fetchBookings.mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(currentRequest.promise);
  const store = mount();
  await startRequest();
  fireEvent.change(screen.getByRole("textbox", { name: "Search bookings" }), { target: { value: "new" } });
  await startRequest();
  await act(async () => { oldRequest.resolve(result("OLD")); });
  expect(screen.getByRole("status")).toHaveTextContent("Searching bookings...");
  expect(screen.getByRole("status")).toHaveTextContent("Finding bookings that match your search.");
  expect(store.getState().bookings.bookings[0].reference).toBe("CACHED");
  expect(screen.queryByText("OLD")).not.toBeInTheDocument();
  await act(async () => { currentRequest.resolve(result("NEW")); });
  expect(screen.getByText("NEW")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("shows a fetch error and stops loading without displaying cached rows", async () => {
  const request = deferred();
  fetchBookings.mockReturnValue(request.promise);
  mount();
  await startRequest();
  await act(async () => { request.reject(new Error("Connection failed")); });
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load bookings");
  expect(screen.queryByText("CACHED")).not.toBeInTheDocument();
  expect(screen.getByRole("region", { name: "Booking table" })).toHaveAttribute("aria-busy", "false");
  expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();
});

it("shows the empty state only after an empty response arrives", async () => {
  const request = deferred();
  fetchBookings.mockReturnValue(request.promise);
  mount();
  await startRequest();
  await act(async () => { request.resolve(result()); });
  expect(screen.getByRole("status")).toHaveTextContent("No bookings available");
  expect(screen.queryByText("Loading bookings...")).not.toBeInTheDocument();
});

it("shows sorting copy even when a search filter is active", async () => {
  fetchBookings.mockResolvedValue(result("CURRENT"));
  mount();
  await startRequest();
  fireEvent.change(screen.getByRole("textbox", { name: "Search bookings" }), { target: { value: "Ana" } });
  await startRequest();
  const request = deferred();
  fetchBookings.mockReturnValue(request.promise);
  fireEvent.click(screen.getByRole("button", { name: "Schedule" }));
  expect(screen.getByRole("status")).toHaveTextContent("Sorting bookings...");
  expect(screen.getByRole("status")).toHaveTextContent("Updating the booking list.");
  await startRequest();
  expect(fetchBookings).toHaveBeenLastCalledWith(expect.objectContaining({ sortOrder: "desc", search: "Ana" }));
  await act(async () => { request.resolve(result("SORTED")); });
  expect(screen.getByText("SORTED")).toBeInTheDocument();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("requests the selected row limit and resets to the first page", async () => {
  fetchBookings.mockResolvedValue(result("CURRENT"));
  mount();
  await startRequest();
  fireEvent.click(screen.getByRole("button", { name: "Go to next page" }));
  await startRequest();
  expect(fetchBookings).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, limit: 5 }));
  fireEvent.keyDown(screen.getByRole("button", { name: "Rows per page: 5" }), { key: "Enter" });
  fireEvent.click(screen.getByRole("menuitem", { name: "25" }));
  expect(screen.getByRole("button", { name: "Rows per page: 25" })).toBeDisabled();
  await startRequest();
  expect(fetchBookings).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, limit: 25 }));
  expect(screen.getByRole("button", { name: "Rows per page: 25" })).toHaveTextContent("25");
  expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
});

