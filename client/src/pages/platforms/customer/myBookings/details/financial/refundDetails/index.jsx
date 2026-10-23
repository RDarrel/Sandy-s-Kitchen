import { useSelector } from "react-redux";
import { useState } from "react";
import { ArrowDownLeft, Image, TriangleAlert } from "lucide-react";
import Cloudinary from "@/services/utilities/cloudinary";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Formatter } from "@/services/utilities";
import { FramedCard, FrameTitle } from "../../components";
import AmountRow from "../amountRow";
import { Button } from "@/components/ui/button";
import UpdateRefundDetails from "./updateRefundDetails";

const RefundDetails = ({ booking }) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [proofError, setProofError] = useState(false);
  const paymentMethods = useSelector(
    (state) => state.paymentMethods?.collections ?? [],
  );
  const refund = booking?.cancellation?.refund;

  if (booking?.status !== "cancelled" || !(Number(refund?.amount) > 0)) {
    return null;
  }

  const completed = refund.status === "completed";
  const pending = refund.status === "pending";

  const proofSrc =
    completed && refund.proofImgId && booking?._id
      ? `${Cloudinary.getEndpoint()}/${refund.proofImgId}/refunds/${booking._id}`
      : null;

  const needsCorrection = refund.accountCorrection?.required === true;
  const methodId = refund.method?._id ?? refund.method;
  const methodName =
    refund.method?.name ||
    paymentMethods.find(({ _id }) => _id === methodId)?.name;
  const accountNumber = String(refund.accountNumber ?? "").replace(/\s/g, "");
  const hasRefundedDate =
    completed &&
    refund.refundedAt &&
    !Number.isNaN(new Date(refund.refundedAt).getTime());

  return (
    <FramedCard
      header={
        <FrameTitle
          title="Refund Details"
          afterTitle={
            (needsCorrection || pending || completed) && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold leading-none ${
                  needsCorrection
                    ? "bg-destructive/10 text-destructive"
                    : completed
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}
              >
                {needsCorrection
                  ? "Action required"
                  : completed
                    ? "Completed"
                    : "Pending"}
              </span>
            )
          }
          trailing={
            <ArrowDownLeft className="size-3.5 text-muted-foreground" />
          }
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
          <Detail
            label="Refunded Date"
            value={Formatter.date(refund.refundedAt, true)}
          />
        )}
        {completed && (
          <Detail label="Refund Reference Number" value={refund.reference} />
        )}
      </div>
      {completed && (
        <div className="border-t p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-full gap-1.5 text-xs shadow-none"
            disabled={!proofSrc}
            aria-haspopup="dialog"
            onClick={() => {
              setProofError(false);
              setShowProof(true);
            }}
          >
            <Image aria-hidden="true" className="size-3.5" />
            View Proof of Refund
          </Button>
        </div>
      )}
      {needsCorrection && (
        <div className="space-y-3 border-t p-3">
          <div className="flex items-start gap-2">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-destructive"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold">
                Account Correction Required
              </p>
              {refund.accountCorrection?.reason && (
                <p
                  title={refund.accountCorrection.reason}
                  className="truncate text-xs leading-5 text-muted-foreground"
                >
                  {refund.accountCorrection.reason}
                </p>
              )}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 w-full text-xs"
            onClick={() => setShowUpdateDialog(true)}
          >
            Update Refund Details
          </Button>
        </div>
      )}
      {showUpdateDialog && (
        <UpdateRefundDetails
          booking={booking}
          onClose={() => setShowUpdateDialog(false)}
        />
      )}
      {proofSrc && (
        <AlertDialog open={showProof} onOpenChange={setShowProof}>
          <AlertDialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
            <AlertDialogHeader className="shrink-0 gap-0.5 border-b px-4 py-3 text-left">
              <AlertDialogTitle className="text-lg font-semibold">
                Proof of Refund
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-5">
                {booking.reference || "Refund receipt"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="min-h-0 overflow-y-auto bg-muted/10 p-3">
              {proofError ? (
                <p
                  role="status"
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Unable to load refund proof.
                </p>
              ) : (
                <img
                  src={proofSrc}
                  alt={`Refund proof for ${booking.reference || "this booking"}`}
                  className="mx-auto max-h-[65dvh] w-full rounded object-contain"
                  onError={() => setProofError(true)}
                />
              )}
            </div>
            <AlertDialogFooter className="shrink-0 border-t px-4 py-3">
              <AlertDialogCancel className="mt-0 h-8 text-sm shadow-none">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </FramedCard>
  );
};

const Detail = ({ label, value }) =>
  value ? (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[58%] break-words text-right font-medium">
        {value}
      </span>
    </div>
  ) : null;

export default RefundDetails;
