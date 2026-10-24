import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FinancialDetails from "./index";

vi.mock("./paymentDetails", () => ({ default: () => null }));
vi.mock("@/pages/platforms/customer/myBookings/details/financial/refundDetails/updateRefundDetails", () => ({ default: () => null }));
vi.mock("@/services/utilities", () => ({
  Formatter: {
    amount: (value) => `PHP ${Number(value).toFixed(2)}`,
    date: (value) => new Date(value).toISOString().slice(0, 10),
  },
}));

afterEach(cleanup);

const renderFinancial = (booking) => render(
  <Provider store={configureStore({ reducer: { paymentMethods: () => ({ collections: [] }) } })}>
    <MemoryRouter><FinancialDetails booking={booking} /></MemoryRouter>
  </Provider>,
);

const summary = () => screen.getByText("Payment summary").closest('[data-slot="frame"]');

describe("admin booking financial details", () => {
  it("subtracts verified and pending payments without treating rejected payments as paid", () => {
    renderFinancial({
      status: "confirmed", pricing: { total: 10000 },
      payments: [
        { _id: "1", status: "verified", amount: 2000 },
        { _id: "2", status: "pending", amount: 3000 },
        { _id: "3", status: "voided", amount: 1000 },
      ],
    });
    expect(screen.getByText("Balance after verification")).toBeInTheDocument();
    expect(within(summary()).getByText("PHP 5000.00")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pay now/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Refund Details")).not.toBeInTheDocument();
  });

  it.each(["pending", "completed"])("shows a %s cancellation refund with the saved paid amount and account", (status) => {
    renderFinancial({
      status: "cancelled", pricing: { total: 10000 }, payments: [],
      cancellation: {
        totalPaid: 8000, nonRefundableAmount: 3000,
        refund: {
          amount: 5000, status, accountProvidedBy: "customer",
          method: { name: "Bank" }, accountName: "Customer Name", accountNumber: "123456789",
          refundedAt: "2026-10-22T08:00:00Z", reference: "REF-123",
          accountCorrection: { required: true, reason: "Check account number" },
        },
      },
    });
    expect(within(summary()).getByText("PHP 8000.00")).toBeInTheDocument();
    expect(within(summary()).getByText("PHP 3000.00")).toBeInTheDocument();
    expect(screen.getByText("Refund Details")).toBeInTheDocument();
    expect(screen.getByText("Bank")).toBeInTheDocument();
    expect(screen.getByText("Customer Name")).toBeInTheDocument();
    expect(screen.queryByText("Remaining balance")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Update Refund Details" })).not.toBeInTheDocument();
    if (status === "completed") {
      expect(screen.getByText("Refund completed")).toBeInTheDocument();
      expect(screen.getByText("REF-123")).toBeInTheDocument();
      expect(screen.getByText("2026-10-22")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "View Proof of Refund" })).toBeDisabled();
    } else {
      expect(screen.getByText("Awaiting refund processing")).toBeInTheDocument();
    }
  });

  it("shows missing refund account details without customer editing actions", () => {
    renderFinancial({ status: "cancelled", cancellation: { totalPaid: 1000, refund: { amount: 1000, status: "pending" } } });
    expect(screen.getByText("Refund account details have not been provided yet.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Provide Refund Details" })).not.toBeInTheDocument();
  });

  it("shows retained payments without a refund card when there is no refund", () => {
    renderFinancial({ status: "cancelled", cancellation: { totalPaid: 2000, nonRefundableAmount: 2000, refund: { amount: 0 } } });
    expect(screen.getByText("This amount will not be refunded.")).toBeInTheDocument();
    expect(screen.queryByText("Refund Details")).not.toBeInTheDocument();
  });

  it("shows rejected bookings as having no recorded payments", () => {
    renderFinancial({ status: "rejected", pricing: { total: 10000 } });
    expect(screen.getByText("No payments recorded")).toBeInTheDocument();
    expect(screen.queryByText("Remaining balance")).not.toBeInTheDocument();
  });
});
