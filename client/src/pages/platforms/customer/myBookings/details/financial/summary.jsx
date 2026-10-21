import { Formatter } from "@/services/utilities";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CreditCard } from "lucide-react";
import AmountRow from "./amountRow";
import { FramedCard, FrameTitle } from "../components";
import {
  formatHours,
  getCancellationSummary,
  getPaymentBreakdownRows,
} from "./utils";

const PaymentSummary = ({ booking, payment, action }) => {
  const navigate = useNavigate();
  const cancellation = getCancellationSummary(booking);
  const totalAmount = cancellation
    ? (booking?.pricing?.total ?? 0)
    : payment.total;
  const verifiedAmount = cancellation
    ? cancellation.totalPaid
    : payment.verifiedAmount;

  const isFullyPaid = payment.total > 0 && payment.balance === 0;

  const hasPendingPayment = Number(payment.pendingAmount || 0) > 0;

  const displayedBalance = hasPendingPayment
    ? Math.max(
        Number(payment.balance || 0) - Number(payment.pendingAmount || 0),
        0,
      )
    : Number(payment.balance || 0);

  const serviceRows = getPaymentBreakdownRows(booking?.pricing);

  return (
    <FramedCard
      header={
        <FrameTitle
          title="Payment summary"
          trailing={<CreditCard className="size-3.5 text-muted-foreground" />}
        />
      }
    >
      <div className="p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">
              {cancellation
                ? cancellation.label
                : isFullyPaid
                  ? "Status"
                  : hasPendingPayment
                    ? "Balance after verification"
                    : "Remaining balance"}
            </p>

            {cancellation ? (
              <>
                <p className="mt-1 text-xl font-semibold leading-none tracking-tight">
                  {Formatter.amount(cancellation.amount)}
                </p>
                {cancellation.message && (
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    {cancellation.message}
                  </p>
                )}
              </>
            ) : isFullyPaid ? (
              <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Fully paid
              </p>
            ) : (
              <p className="mt-1 text-xl font-semibold leading-none tracking-tight">
                {Formatter.amount(displayedBalance)}
              </p>
            )}
          </div>

          <p className="shrink-0 text-right text-[11px] text-muted-foreground">
            of {Formatter.amount(totalAmount)} total
          </p>
        </div>

        <div className="my-3 border-t" />

        <div className="space-y-3">
          {serviceRows.map((service) => (
            <Breakdown key={service.label} service={service} />
          ))}

          <div className="border-t pt-2">
            <AmountRow label="Total amount" value={totalAmount} strong />
          </div>

          {verifiedAmount > 0 && (
            <AmountRow
              label="Verified payments"
              value={verifiedAmount}
              positive
            />
          )}

          {cancellation?.refundAmount > 0 && (
            <AmountRow
              label="Non-refundable Amount"
              value={cancellation.retainedAmount}
            />
          )}

          {cancellation?.totalPaid > 0 && cancellation.refundAmount === 0 && (
            <AmountRow label="Refund Amount" value={0} />
          )}

          {!cancellation && payment.pendingAmount > 0 && (
            <>
              <AmountRow
                label="Pending verification"
                value={payment.pendingAmount}
                pending
              />

              <p className="pt-1 text-[10px] leading-4 text-muted-foreground">
                Your balance will be updated after this payment is verified.
              </p>
            </>
          )}
        </div>

        {!cancellation &&
          action.buttonLabel &&
          booking?.status !== "changes_requested" && (
            <Button
              type="button"
              className="mt-3 h-8 w-full gap-1.5 text-xs"
              onClick={() =>
                navigate(`/platforms/my-bookings/${booking.reference}/payment`)
              }
            >
              {action.buttonLabel}
              <CreditCard className="size-3.5" />
            </Button>
          )}
      </div>
    </FramedCard>
  );
};

export default PaymentSummary;

const Breakdown = ({ service }) => {
  return (
    <div>
      <AmountRow label={service.label} value={service.total} strong />

      <div className="ml-2 mt-1.5 space-y-1.5 border-l pl-3">
        {service.guestCharge > 0 && (
          <PaymentChargeRow
            label="Extra guests"
            detail={`${service.guests.extra} pax`}
            value={service.guestCharge}
          />
        )}

        {service.durationCharge > 0 && (
          <PaymentChargeRow
            label="Extra hours"
            detail={formatHours(service.duration.extra)}
            value={service.durationCharge}
          />
        )}
      </div>
    </div>
  );
};

const PaymentChargeRow = ({ label, detail, value }) => {
  return (
    <div className="relative flex items-start justify-between gap-3 text-xs">
      <span className="absolute -left-3 top-2 h-px w-2.5 bg-border" />

      <span className="text-muted-foreground">
        <span>{label}</span>

        <span className="ml-1 text-[11px]">{detail}</span>
      </span>

      <span>{Formatter.amount(value || 0)}</span>
    </div>
  );
};
