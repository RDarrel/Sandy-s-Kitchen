import { Button } from "@/components/ui/button";
import { Formatter } from "@/services/utilities";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Summary = ({ payment, reference, status, cancellation }) => {
  const isFullyPaid = payment.balance <= 0;
  const refundAmount = Number(cancellation?.refund?.amount || 0);
  const refundStatus = cancellation?.refund?.status;
  const showRefund =
    status === "cancelled" &&
    refundAmount > 0 &&
    ["pending", "completed"].includes(refundStatus);
  const retainedAmount = Math.min(
    Number(payment.verifiedAmount || 0),
    Number(cancellation?.nonRefundableAmount ?? payment.downPayment ?? 0),
  );
  const showRetainedPayment =
    status === "cancelled" &&
    retainedAmount > 0 &&
    !(Number(cancellation?.refund?.amount) > 0);
  const showZeroPaid =
    status === "rejected" ||
    (status === "cancelled" && !payment.hasVerifiedPayments);
  const totalLabel = showRetainedPayment || showRefund ? "Total Paid" : "Booking Total";
  const totalValue = showRetainedPayment || showRefund ? payment.verifiedAmount : payment.total;
  const balanceLabel = showRefund
    ? refundStatus === "completed" ? "Amount Refunded" : "Refund Amount"
    : showRetainedPayment
    ? "Non-refundable amount"
    : showZeroPaid ? "Total Paid" : "Balance";
  const balanceValue = showRefund
    ? Formatter.amount(refundAmount)
    : showRetainedPayment
    ? Formatter.amount(retainedAmount)
    : showZeroPaid
    ? Formatter.amount(0)
    : isFullyPaid ? "Paid" : Formatter.amount(payment.balance);
  const balanceColor = showRefund
    ? refundStatus === "completed" ? "text-emerald-700" : "text-amber-700"
    : showZeroPaid || showRetainedPayment
    ? "text-foreground"
    : isFullyPaid ? "text-emerald-700" : "text-amber-700";
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/platforms/my-bookings/${reference}`);
  };
  return (
    <>
      {/* Mobile compact footer */}
      <div className="border-t bg-muted/10 px-2.5 py-2 xl:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <CompactAmountBlock
              label={totalLabel}
              value={Formatter.amount(totalValue)}
            />

            <CompactAmountBlock
              label={balanceLabel}
              value={balanceValue}
              valueClassName={balanceColor}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="h-8 shrink-0 gap-1 px-2.5 text-[10px] sm:text-xs"
          >
            <span className="hidden sm:inline">View details</span>
            <span className="sm:hidden">Details</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Desktop financial sidebar */}
      <div className="hidden flex-col border-l bg-muted/10 p-3 xl:flex">
        <div className="grid grid-cols-1 gap-3">
          <AmountBlock
            label={totalLabel}
            value={Formatter.amount(totalValue)}
          />

          <AmountBlock
            label={balanceLabel}
            value={balanceValue}
            valueClassName={balanceColor}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 w-full justify-between text-xs"
          onClick={handleViewDetails}
        >
          View details
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </>
  );
};

export default Summary;

const CompactAmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-0.5 truncate text-[13px] font-semibold leading-4 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

const AmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className={`mt-0.5 text-sm font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};
