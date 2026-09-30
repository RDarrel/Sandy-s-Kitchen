import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { TYPE_META } from "../constant";
import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/services/utilities";
import SummaryRow from "./row";
import SectionHeader from "../sectionHeader";
import MethodLogo from "../details/methods/logo";
import Spinner from "@/components/shared/spinner";

const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

const Summary = ({
  payment,
  method,
  paidAmount,
  isLoadingMethod,
  remainingAfterPayment,
  isSubmitting = false,
}) => {
  const hasDepositDue = payment.requiredDeposit > 0;

  const primaryLabel = hasDepositDue
    ? "Minimum payment due"
    : "Current balance";

  const primaryAmount = hasDepositDue
    ? payment.requiredDeposit
    : payment.balance;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="bg-background px-3 py-3 sm:px-4">
        <SectionHeader
          title="Payment summary"
          description="Review the amount before submitting your payment."
        />
      </div>

      <div className="border-t bg-muted/5 px-3 py-3.5 sm:px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {primaryLabel}
            </p>

            <p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight sm:text-[1.75rem]">
              {Formatter.amount(primaryAmount)}
            </p>
          </div>

          {hasDepositDue && payment.depositDeadline && (
            <span className="shrink-0 rounded-md bg-muted/40 px-2 py-1 text-xs font-medium leading-4 text-muted-foreground">
              Due {formatDate(payment.depositDeadline)}
            </span>
          )}
        </div>
      </div>

      <div className="border-t px-3 py-3 sm:px-4">
        <SummaryRow
          label="Booking total"
          value={Formatter.amount(payment.total)}
        />

        <SummaryRow
          label="Already paid"
          value={Formatter.amount(payment.received)}
        />

        {hasDepositDue && (
          <SummaryRow
            label="Current balance"
            value={Formatter.amount(payment.balance)}
          />
        )}
      </div>

      {/* {hasValidPaymentAmount && ( */}
      <div className="border-t bg-muted/5 px-3 py-3 sm:px-4">
        <SummaryRow
          label="Paying now"
          value={Formatter.amount(paidAmount)}
          strong
        />

        <SummaryRow
          label="Balance after"
          value={Formatter.amount(remainingAfterPayment)}
        />
      </div>
      {/* )} */}

      <div className="border-t px-3 py-3.5 sm:px-4">
        {isLoadingMethod ? (
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-1.5 h-3.5 w-24" />
            </div>

            <Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
          </div>
        ) : method ? (
          <div className="flex items-center gap-2.5">
            <MethodLogo method={method} className="size-9 p-1.5" />

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Paying with</p>

              <p className="mt-0.5 truncate text-sm font-semibold">
                {method.name}
              </p>
            </div>

            <span className="ml-auto shrink-0 rounded-sm border bg-muted/20 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {TYPE_META[method.type]?.label || "Payment method"}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a payment method to continue.
          </p>
        )}
      </div>

      {/* Desktop submit */}
      <div className="hidden border-t p-3 lg:block">
        <Button
          className="h-9 w-full gap-1.5 text-xs"
          disabled={!method || isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <Spinner formSubmitted={isSubmitting} />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          Submit payment
        </Button>

        <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">
          Payment will be reviewed before your booking is updated.
        </p>
      </div>
    </div>
  );
};
export default Summary;
