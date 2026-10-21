import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PaymentSummary from "./summary";
import RefundDetails from "./refundDetails";
import { getCancellationSummary } from "./utils";

vi.mock("@/services/utilities", () => ({
  Formatter: {
    amount: (value) => `PHP ${Number(value).toFixed(2)}`,
    date: (value) => new Date(value).toISOString().slice(0, 10),
  },
}));

afterEach(cleanup);

const cancelledBooking = (cancellation) => ({
  status: "cancelled",
  pricing: { total: 10000 },
  cancellation,
});

const renderSummary = (booking, payment = {}) => render(
  <MemoryRouter>
    <PaymentSummary
      booking={booking}
      payment={{ total: 10000, balance: 8000, verifiedAmount: 2000, ...payment }}
      action={{ buttonLabel: "Pay now" }}
    />
  </MemoryRouter>,
);

const renderRefund = (booking, methods = []) => render(
  <Provider store={configureStore({
    reducer: { paymentMethods: () => ({ collections: methods }) },
  })}>
    <RefundDetails booking={booking} />
  </Provider>,
);

describe("cancelled payment summary", () => {
  it.each([
    ["pending", "Refund Amount", "Awaiting refund processing"],
    ["completed", "Refunded Amount", "Refund completed"],
  ])("shows a %s refund instead of balance or payment actions", (status, label, message) => {
    renderSummary(cancelledBooking({
      totalPaid: 8000,
      nonRefundableAmount: 3000,
      refund: { amount: 5000, status },
    }));
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByText("PHP 5000.00")).toBeInTheDocument();
    expect(screen.getByText("PHP 3000.00")).toBeInTheDocument();
    expect(screen.getByText("PHP 8000.00")).toBeInTheDocument();
    expect(screen.queryByText("Pay now")).not.toBeInTheDocument();
    expect(screen.queryByText("Remaining balance")).not.toBeInTheDocument();
  });

  it("caps the retained amount at the actual payment and shows a zero refund", () => {
    renderSummary(cancelledBooking({ totalPaid: 1000, nonRefundableAmount: 3000 }));
    expect(screen.getByText("Non-refundable Amount")).toBeInTheDocument();
    expect(screen.getByText("This amount will not be refunded.")).toBeInTheDocument();
    expect(screen.getByText("Refund Amount")).toBeInTheDocument();
    expect(screen.getByText("PHP 0.00")).toBeInTheDocument();
    expect(screen.queryByText("PHP 3000.00")).not.toBeInTheDocument();
  });

  it("handles absent cancellation data without redundant payment rows", () => {
    renderSummary(cancelledBooking());
    expect(screen.getByText("Total Paid")).toBeInTheDocument();
    expect(screen.getByText("No payments were made for this booking.")).toBeInTheDocument();
    expect(screen.queryByText("Verified payments")).not.toBeInTheDocument();
    expect(screen.queryByText("Refund Amount")).not.toBeInTheDocument();
  });

  it("preserves balance, pending verification, payment action, and fully paid states", () => {
    const view = renderSummary({ status: "approved" }, { pendingAmount: 1000 });
    expect(screen.getByText("Balance after verification")).toBeInTheDocument();
    expect(screen.getByText("PHP 7000.00")).toBeInTheDocument();
    expect(screen.getByText("Pending verification")).toBeInTheDocument();
    expect(screen.getByText("Pay now")).toBeInTheDocument();
    view.unmount();
    renderSummary({ status: "confirmed" }, { balance: 0 });
    expect(screen.getByText("Fully paid")).toBeInTheDocument();
    expect(getCancellationSummary({ status: "confirmed" })).toBeNull();
  });
});

describe("refund details", () => {
  it("resolves an inactive method by ID and masks the account number", () => {
    renderRefund(cancelledBooking({ refund: {
      amount: 5000, status: "pending", method: "method-id",
      accountName: "Customer Name", accountNumber: "09123456789",
    } }), [{ _id: "method-id", name: "Wallet", isActive: false }]);
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Customer Name")).toBeInTheDocument();
    expect(screen.getByText("•••••••6789")).toBeInTheDocument();
    expect(screen.queryByText("09123456789")).not.toBeInTheDocument();
    expect(screen.getByText("Your refund is awaiting processing.")).toBeInTheDocument();
    expect(screen.queryByText("Refunded Date")).not.toBeInTheDocument();
  });

  it("uses a populated method and shows completed refund metadata", () => {
    renderRefund(cancelledBooking({ refund: {
      amount: 5000, status: "completed", method: { _id: "method-id", name: "Bank" },
      refundedAt: "2026-10-22T08:00:00Z", reference: "REF-123",
    } }));
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Refunded Amount")).toBeInTheDocument();
    expect(screen.getByText("Bank")).toBeInTheDocument();
    expect(screen.getByText("2026-10-22")).toBeInTheDocument();
    expect(screen.getByText("REF-123")).toBeInTheDocument();
    expect(screen.getByText("Your refund has been processed.")).toBeInTheDocument();
  });

  it("hides missing fields, unknown method IDs, invalid dates, and unsupported proof", () => {
    renderRefund(cancelledBooking({ refund: {
      amount: 5000, status: "completed", method: "unknown-id",
      refundedAt: "invalid", proofImgId: "unknown-proof-format",
    } }));
    for (const label of ["Refund Method", "Account Name", "Account Number", "Refunded Date", "Refund Reference Number", "View Refund Proof", "unknown-id"]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it.each([
    { status: "approved", cancellation: { refund: { amount: 5000 } } },
    cancelledBooking({ refund: { amount: 0 } }),
    cancelledBooking(),
  ])("hides the card when no cancelled refund is available", (booking) => {
    const { container } = renderRefund(booking);
    expect(container).toBeEmptyDOMElement();
  });
});
