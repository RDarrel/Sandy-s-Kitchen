import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import PaymentDetails from "./index";
import Cloudinary from "@/services/utilities/cloudinary";

vi.mock("@/services/utilities", () => ({
  Formatter: { amount: (value) => `PHP ${value}`, date: (value) => value },
  fullName: ({ fname, lname }) => `${fname} ${lname}`,
}));

afterEach(cleanup);

const baseRefund = {
  transactionType: "refund", status: "completed", amount: 20425,
  totalPaid: 25000, nonRefundableAmount: 4575,
  method: { _id: "bank", name: "BDO" }, accountProvidedBy: "customer",
  accountName: "Customer Name", accountNumber: "1234561234",
  accountProvidedAt: "2026-10-23", cancellationReason: "Event cancelled",
  processedBy: { fullName: { fname: "Staff", lname: "Name" } },
  refundedAt: "2026-10-24", proofImgId: "v123", reference: "REF-123",
};

const showDetails = (payment) => render(
  <PaymentDetails isOpen setIsOpen={() => {}} booking={{ _id: "booking-id", reference: "B-123" }} payment={payment} />,
);

describe("report transaction details", () => {
  it("shows completed refund breakdown, processing information and booking-based proof", () => {
    showDetails(baseRefund);
    expect(screen.getByText("Refund slip")).toBeInTheDocument();
    expect(screen.getByText("PHP 25000")).toBeInTheDocument();
    expect(screen.getByText("PHP 4575")).toBeInTheDocument();
    expect(screen.getByText("Event cancelled")).toBeInTheDocument();
    expect(screen.getByText("Staff Name")).toBeInTheDocument();
    expect(screen.getByText("Processing Information")).toBeInTheDocument();
    expect(screen.getByText("•••• 1234")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Refund proof" })).toHaveAttribute("src", `${Cloudinary.getEndpoint()}/v123/refunds/booking-id`);
    expect(screen.queryByText("Verification Information")).not.toBeInTheDocument();
    expect(screen.queryByText("Payment Type")).not.toBeInTheDocument();
  });

  it("hides proof and processing information while pending even when stale processing data exists", () => {
    showDetails({ ...baseRefund, status: "pending" });
    expect(screen.getByText("Awaiting refund processing")).toBeInTheDocument();
    expect(screen.queryByText("Processing Information")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Refund Reference")).not.toBeInTheDocument();
  });

  it("shows an admin message instead of empty account fields when account details are missing", () => {
    showDetails({ ...baseRefund, status: "pending", accountProvidedBy: null });
    expect(screen.getByText("Refund account needed")).toBeInTheDocument();
    expect(screen.getByText(/Obtain the customer's GCash or bank account/)).toBeInTheDocument();
    expect(screen.queryByText("Account Number")).not.toBeInTheDocument();
  });

  it("preserves the default payment slip and payment proof path", () => {
    showDetails({ _id: "payment-id", status: "verified", type: "deposit", amount: 5000, method: { _id: "bank", name: "BDO" }, proofImgId: "v456" });
    expect(screen.getByText("Payment slip")).toBeInTheDocument();
    expect(screen.getByText("Payment verified")).toBeInTheDocument();
    expect(screen.getByText("Verification Information")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Customer payment proof" })).toHaveAttribute("src", Cloudinary.getPaymentProofImgId("v456", "payment-id", "bank"));
    expect(screen.queryByText("Refund Breakdown")).not.toBeInTheDocument();
  });
});
