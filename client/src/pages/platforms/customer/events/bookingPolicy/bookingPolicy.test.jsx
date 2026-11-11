import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CateringReview from "../catering/inquire/steps/step6";
import VenueReview from "../venues/inquire/steps/step7";
import BookingPolicy from "./index";
import TermsSummary from "../../myBookings/details/financial/terms";
import { axioKit } from "@/services/utilities";

vi.mock("@/services/utilities", () => ({
  axioKit: { universal: vi.fn() },
  Formatter: {
    amount: (value) => String(value),
    date: () => "Event date",
    bookingDateRange: () => "Event schedule",
    preferredContact: () => "Email",
  },
}));
vi.mock("react-redux", () => ({
  useSelector: (selector) => selector({ bookings: { formSubmitted: false } }),
}));

const policy = {
  depositPercent: 40,
  reservationHoldHours: 36,
  cancellationDeadlineDays: 5,
  balanceDueDaysBeforeEvent: 3,
  depositRefundable: false,
};

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  axioKit.universal.mockResolvedValue({ data: policy });
});

describe.each([
  ["catering", CateringReview, "Submit"],
  ["venue", VenueReview, "Send Inquiry"],
])("%s booking policy", (bookingType, Review, submitLabel) => {
  const showReview = (handleSubmit = vi.fn()) => {
    render(<Review form={{ bookingType }} estimate={{}} handleSubmit={handleSubmit} />);
    return handleSubmit;
  };

  it("requires acknowledgment after loading the real policy before submitting", async () => {
    const submit = showReview();
    const button = screen.getByRole("button", { name: submitLabel });
    const checkbox = screen.getByRole("checkbox");
    const reportValidity = vi.spyOn(checkbox, "reportValidity");
    expect(button).toBeEnabled();
    expect(checkbox).toBeRequired();
    expect(checkbox.validity.valueMissing).toBe(true);
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
    expect(reportValidity).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-required", "true");
    expect(screen.queryByText(/A down payment of 40%/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("40%", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText(/within 36 hour/)).toBeInTheDocument();
    expect(button).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "I have read and agree" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(checkbox.validity.valid).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(checkbox.validity.valueMissing).toBe(true);
    expect(reportValidity).toHaveBeenCalledTimes(3);
  });

  it("keeps submission blocked on failure and allows retry", async () => {
    axioKit.universal.mockRejectedValueOnce(new Error("Offline"));
    showReview();
    const button = screen.getByRole("button", { name: submitLabel });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not be loaded/);
    expect(button).toBeEnabled();
    expect(screen.getByRole("button", { name: "I have read and agree" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("40%", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I have read and agree" })).toBeEnabled();
    fireEvent.click(screen.getAllByRole("button", { name: "Close", exact: true })[0]);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(screen.getByRole("checkbox").validity.valueMissing).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

it("shows the general policy before approval without calculated booking terms", async () => {
  render(<BookingPolicy />);
  expect(await screen.findByText("40%", { selector: "strong" })).toBeInTheDocument();
  expect(screen.getByText("non-refundable", { selector: "strong" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Save PDF/ })).toBeInTheDocument();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

it("uses the approved booking policy snapshot instead of newly changed settings", () => {
  render(<BookingPolicy terms={{ ...policy, depositPercent: 25 }} />);
  expect(screen.getByText("25%", { selector: "strong" })).toBeInTheDocument();
  expect(axioKit.universal).not.toHaveBeenCalled();
});

it("does not substitute made-up defaults when no policy is configured", async () => {
  axioKit.universal.mockResolvedValue({ data: null });
  render(<BookingPolicy />);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Save PDF/ })).not.toBeInTheDocument();
});

it("keeps the pending booking policy behind a button in booking terms", async () => {
  render(<TermsSummary />);
  expect(screen.getByText("Booking terms")).toBeInTheDocument();
  expect(screen.queryByText(/A down payment of/)).not.toBeInTheDocument();
  expect(axioKit.universal).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "View booking policy" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(await screen.findByText("40%", { selector: "strong" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Save PDF/ })).toBeInTheDocument();
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

it("retains approved payment terms and opens the saved policy in a modal", () => {
  render(<TermsSummary terms={{ ...policy, depositPercent: 25, requiredDeposit: 2500 }} />);
  expect(screen.getByText("2500")).toBeInTheDocument();
  expect(screen.getByText("Full payment due")).toBeInTheDocument();
  expect(screen.queryByText(/A down payment of/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "View booking policy" }));
  expect(screen.getByText("25%", { selector: "strong" })).toBeInTheDocument();
  expect(axioKit.universal).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByRole("button", { name: "Close", exact: true })[0]);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
