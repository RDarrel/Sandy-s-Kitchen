import { useSelector } from "react-redux";
import { useState } from "react";
import { ArrowDownLeft, TriangleAlert } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { FramedCard, FrameTitle } from "../../components";
import AmountRow from "../amountRow";
import { Button } from "@/components/ui/button";
import UpdateRefundDetails from "./updateRefundDetails";

const RefundDetails = ({ booking }) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const paymentMethods = useSelector(
    (state) => state.paymentMethods?.collections ?? [],
  );
  const refund = booking?.cancellation?.refund;

  if (booking?.status !== "cancelled" || !(Number(refund?.amount) > 0)) {
    return null;
  }

  const completed = refund.status === "completed";
  const pending = refund.status === "pending";
  const needsCorrection = refund.accountCorrection?.required === true;
  const methodId = refund.method?._id ?? refund.method;
  const methodName = refund.method?.name || paymentMethods.find(
    ({ _id }) => _id === methodId,
  )?.name;
  const accountNumber = String(refund.accountNumber ?? "").replace(/\s/g, "");
  const hasRefundedDate = completed && refund.refundedAt &&
    !Number.isNaN(new Date(refund.refundedAt).getTime());

  return (
    <FramedCard
      header={
        <FrameTitle
          title="Refund Details"
          afterTitle={(needsCorrection || pending || completed) && (
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
              needsCorrection
                ? "bg-destructive/10 text-destructive"
                : completed
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}>
              {needsCorrection ? "Action required" : completed ? "Completed" : "Pending"}
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
        <Detail label="Account Number" value={accountNumber} />
        {hasRefundedDate && (
          <Detail label="Refunded Date" value={Formatter.date(refund.refundedAt, true)} />
        )}
        {completed && <Detail label="Refund Reference Number" value={refund.reference} />}
        {!needsCorrection && completed && (
          <p className="border-t pt-2 text-[10px] leading-4 text-muted-foreground">
            Your refund has been processed.
          </p>
        )}
      </div>
      {needsCorrection && (
        <div className="space-y-3 border-t p-3">
          <div className="flex items-start gap-2">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold">Account Correction Required</p>
              {refund.accountCorrection?.reason && (
                <p title={refund.accountCorrection.reason} className="truncate text-xs leading-5 text-muted-foreground">
                  {refund.accountCorrection.reason}
                </p>
              )}
            </div>
          </div>
          <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={() => setShowUpdateDialog(true)}>
            Update Refund Details
          </Button>
        </div>
      )}
      {showUpdateDialog && (
        <UpdateRefundDetails booking={booking} onClose={() => setShowUpdateDialog(false)} />
      )}
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
