import { Wallet } from "lucide-react";
import { PAYMENT_SUMMARY_STYLES, PAYMENT_TEXT_STYLES } from "../../constant";
import { Formatter } from "@/services/utilities";

const PaymentSummary = ({ payment, booking }) => {
  const { payments = [] } = booking;

  const hasPayment = payments.length > 0;

  const isPaid = payment.status === "paid";
  const isPending = payment.status === "pending";
  const statusStyle = PAYMENT_TEXT_STYLES[payment.status] || "text-foreground";
  const summaryStyle =
    PAYMENT_SUMMARY_STYLES[payment.status] || "border-border bg-muted/25";
  const label = isPending
    ? "Estimated total"
    : isPaid
      ? "Paid in full"
      : hasPayment
        ? "Partial payment"
        : "No payment yet";
  const amountLabel =
    isPaid || isPending
      ? Formatter.amount(payment.total)
      : `Bal. ${Formatter.amount(payment.balance)}`;

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-2 py-1.5 ${summaryStyle}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Wallet className={`size-3.5 shrink-0 ${statusStyle}`} />

        <div className="min-w-0">
          <p className={`truncate font-medium leading-4 ${statusStyle}`}>
            {label}
          </p>

          <p className="truncate text-[11px] leading-4 text-muted-foreground">
            {isPending
              ? "Subject to approval"
              : isPaid
                ? "Payment settled"
                : hasPayment
                  ? `Received ${Formatter.amount(payment.received)}`
                  : `Total ${Formatter.amount(payment.total)}`}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold leading-4 text-foreground">{amountLabel}</p>

        {isPending ? (
          <p className="text-[11px] leading-4 text-muted-foreground">{null}</p>
        ) : !isPaid ? (
          <p className="text-[11px] leading-4 text-muted-foreground">
            to collect
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentSummary;
