import { useSelector } from "react-redux";
import { ArrowDownLeft } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { FramedCard, FrameTitle } from "../components";
import AmountRow from "./amountRow";

const RefundDetails = ({ booking }) => {
  const paymentMethods = useSelector(
    (state) => state.paymentMethods?.collections ?? [],
  );
  const refund = booking?.cancellation?.refund;

  if (booking?.status !== "cancelled" || !(Number(refund?.amount) > 0)) {
    return null;
  }

  const completed = refund.status === "completed";
  const pending = refund.status === "pending";
  const methodId = refund.method?._id ?? refund.method;
  const methodName = refund.method?.name || paymentMethods.find(
    ({ _id }) => _id === methodId,
  )?.name;
  const accountNumber = String(refund.accountNumber ?? "").replace(/\s/g, "");
  const maskedNumber = accountNumber
    ? accountNumber.length > 4
      ? `${"•".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`
      : "•".repeat(accountNumber.length)
    : "";
  const hasRefundedDate = completed && refund.refundedAt &&
    !Number.isNaN(new Date(refund.refundedAt).getTime());

  return (
    <FramedCard
      header={
        <FrameTitle
          title="Refund Details"
          afterTitle={(pending || completed) && (
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
              completed
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}>
              {completed ? "Completed" : "Pending"}
            </span>
          )}
          trailing={<ArrowDownLeft className="size-3.5 text-muted-foreground" />}
        />
      }
    >
      <div className="space-y-3 p-3">
        <AmountRow
          label={completed ? "Refunded Amount" : "Refund Amount"}
          value={refund.amount}
          strong
        />
        <Detail label="Refund Method" value={methodName} />
        <Detail label="Account Name" value={refund.accountName} />
        <Detail label="Account Number" value={maskedNumber} />
        {hasRefundedDate && (
          <Detail label="Refunded Date" value={Formatter.date(refund.refundedAt, true)} />
        )}
        {completed && <Detail label="Refund Reference Number" value={refund.reference} />}
        {(pending || completed) && (
          <p className="border-t pt-2 text-[10px] leading-4 text-muted-foreground">
            {completed
              ? "Your refund has been processed."
              : "Your refund is awaiting processing."}
          </p>
        )}
      </div>
    </FramedCard>
  );
};

const Detail = ({ label, value }) => value ? (
  <div className="flex items-start justify-between gap-4 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[58%] break-words text-right font-medium">{value}</span>
  </div>
) : null;

export default RefundDetails;
