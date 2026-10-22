import { useSelector } from "react-redux";
import { useState } from "react";
import { Content } from "@radix-ui/react-alert-dialog";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { ArrowLeft, CircleCheck, CircleMinus, Clock3, ExternalLink, FileText, ReceiptText, Wallet } from "lucide-react";
import Cloudinary from "@/services/utilities/cloudinary";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Formatter, fullName } from "@/services/utilities";

const CancelledDetails = ({ booking, onBack }) => {
  const [showProof, setShowProof] = useState(false);
  const [proofError, setProofError] = useState(false);
  const methods = useSelector((state) => state.paymentMethods?.collections ?? []);
  const cancellation = booking?.cancellation ?? {};
  const refund = cancellation.refund ?? {};
  const totalPaid = Number(cancellation.totalPaid ?? 0);
  const retained = Math.min(totalPaid, Number(cancellation.nonRefundableAmount ?? 0));
  const hasRefundStatus = (refund.status ?? "none") !== "none";
  const hasRefund = hasRefundStatus && Number(refund.amount) > 0;
  const completed = hasRefund && refund.status === "completed";
  const pending = hasRefund && refund.status === "pending";
  const methodId = refund.method?._id ?? refund.method;
  const methodName = refund.method?.name || methods.find(({ _id }) => _id === methodId)?.name;
  const correction = refund.accountCorrection;
  const hasDate = (value) => Boolean(value && !Number.isNaN(new Date(value).getTime()));
  const processor = refund.processedBy?.fullName ? fullName(refund.processedBy.fullName) : "Not available";
  const proofSrc = completed && refund.proofImgId && booking?._id
    ? `${Cloudinary.getEndpoint()}/${refund.proofImgId}/refunds/${booking._id}`
    : null;

  return (
    <>
      <DialogHeader className="shrink-0 space-y-0 border-b bg-muted/20 px-3 py-3 text-left sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Button type="button" variant="outline" size="icon-sm" className="size-7 shrink-0 bg-background shadow-none" aria-label="Back to cancelled bookings" onClick={onBack}><ArrowLeft className="size-4" /></Button>
            <DialogTitle className="text-base font-semibold">Cancellation Details</DialogTitle>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${completed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : pending ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
            {completed ? <CircleCheck aria-hidden="true" className="size-3.5 shrink-0" /> : hasRefund ? <Clock3 aria-hidden="true" className="size-3.5 shrink-0" /> : <CircleMinus aria-hidden="true" className="size-3.5 shrink-0" />}
            {completed ? "Refund completed" : pending ? "Refund pending" : hasRefund ? "Refund due" : "No Refund"}
          </span>
        </div>
        <DialogDescription className="sr-only">Cancellation information and payment breakdown for the selected booking.</DialogDescription>
      </DialogHeader>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{booking?.eventType || "Event booking"}</h3>
          <p className="break-words text-xs leading-5 text-muted-foreground">{[booking?.reference, booking?.customer?.fullName ? fullName(booking.customer.fullName) : null].filter(Boolean).join(" · ")}</p>
          {hasDate(cancellation.cancelledAt) && <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><Clock3 aria-hidden="true" className="mt-1 size-3 shrink-0" />Cancelled on {Formatter.date(cancellation.cancelledAt, true)}</p>}
        </div>

        <Section title="Reason for cancellation" icon={<FileText className="size-3.5" />}>
          <p className="whitespace-pre-wrap break-words border-l-2 border-primary/25 pl-3 text-sm leading-6 text-foreground/85">{cancellation.reason || "No reason provided."}</p>
        </Section>

        <Section title="Payment breakdown" icon={<ReceiptText className="size-3.5" />}>
          <dl className="space-y-2.5">
            <Detail label="Total Paid" value={Formatter.amount(totalPaid)} />
            <Detail label="Retained Payment" value={`${retained > 0 ? "−" : ""}${Formatter.amount(retained)}`} />
            <div className="-mx-3 -mb-3 border-t border-primary/10 bg-primary/5 px-3 py-3"><Detail label="Refund Amount" value={Formatter.amount(refund.amount ?? 0)} strong /></div>
          </dl>
        </Section>

        {hasRefund && (
          <Section title="Refund details" icon={<Wallet className="size-3.5" />}>
            <dl className="space-y-2.5">
              <Detail label="Refund Method" value={methodName || "Not available"} />
              <Detail label="Account Name" value={refund.accountName || "Not available"} />
              <Detail label="Account Number" value={refund.accountNumber || "Not available"} />
            </dl>
          </Section>
        )}

        {completed && (
          <Section title="Refund transaction" icon={<ReceiptText className="size-3.5" />} action={proofSrc && (
            <Button type="button" variant="link" className="h-auto gap-1.5 p-0 text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 [&_svg]:size-3.5" aria-haspopup="dialog" onClick={() => {
              setProofError(false);
              setShowProof(true);
            }}>
              <span>View Proof</span>
              <ExternalLink aria-hidden="true" />
            </Button>
          )}>
            <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <dt className="text-xs text-muted-foreground">Processed by</dt>
                <dd className="break-words text-sm font-medium">{processor}</dd>
              </div>
              {hasDate(refund.refundedAt) && (
                <div className="min-w-0 space-y-1">
                  <dt className="text-xs text-muted-foreground">Processed on</dt>
                  <dd className="text-xs font-medium leading-5 tabular-nums">{Formatter.date(refund.refundedAt, true)}</dd>
                </div>
              )}
              {refund.reference && (
                <div className="min-w-0 space-y-1 border-t pt-2.5 min-[400px]:col-span-2">
                  <dt className="text-xs text-muted-foreground">Transaction Reference</dt>
                  <dd className="break-all font-mono text-xs font-medium leading-5">{refund.reference}</dd>
                </div>
              )}
            </dl>
          </Section>
        )}

        {hasRefund && correction?.required === true && (
          <Section title="Account correction request" icon={<FileText className="size-3.5" />}>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Customer</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-5">{correction.reason || "No reason provided."}</p>
            <dl className="space-y-2">
              {correction.requestedBy?.fullName && <Detail label="Requested by" value={fullName(correction.requestedBy.fullName)} />}
              {hasDate(correction.requestedAt) && <Detail label="Requested on" value={Formatter.date(correction.requestedAt, true)} />}
            </dl>
          </Section>
        )}
      </div>
      {proofSrc && (
        <AlertDialog open={showProof} onOpenChange={setShowProof}>
          <AlertDialogPortal>
            <AlertDialogOverlay className="z-[120] bg-black/60" />
            <Content className="fixed left-1/2 top-1/2 z-[130] flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-xl outline-none">
              <div className="shrink-0 space-y-0.5 border-b px-4 py-3">
                <AlertDialogTitle className="text-lg font-semibold">Refund Proof</AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-5">{booking.reference || "Refund transfer receipt"}</AlertDialogDescription>
              </div>
              <div className="min-h-0 overflow-y-auto bg-muted/10 p-3">
                {proofError ? (
                  <p role="status" className="py-8 text-center text-sm text-muted-foreground">Unable to load refund proof.</p>
                ) : (
                  <img src={proofSrc} alt={`Refund transfer proof for ${booking.reference || "this booking"}`} className="mx-auto max-h-[65dvh] w-full rounded object-contain" onError={() => setProofError(true)} />
                )}
              </div>
              <div className="flex shrink-0 justify-end border-t px-4 py-3">
                <AlertDialogCancel asChild>
                  <Button type="button" variant="outline" size="sm" className="text-sm shadow-none">Close</Button>
                </AlertDialogCancel>
              </div>
            </Content>
          </AlertDialogPortal>
        </AlertDialog>
      )}
    </>
  );
};

const Section = ({ title, icon, action, children }) => (
  <section className="overflow-hidden rounded-lg border bg-background">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/15 px-3 py-2">
      <h4 className="flex items-center gap-2 text-xs font-semibold"><span aria-hidden="true" className="text-muted-foreground">{icon}</span>{title}</h4>
      {action}
    </div>
    <div className="space-y-3 p-3">{children}</div>
  </section>
);

const Detail = ({ label, value, strong = false }) => (
  <div className="flex items-start justify-between gap-4 text-sm leading-5">
    <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
    <dd className={`max-w-[60%] break-words text-right font-semibold tabular-nums ${strong ? "text-base text-primary" : ""}`}>{value}</dd>
  </div>
);

export default CancelledDetails;
