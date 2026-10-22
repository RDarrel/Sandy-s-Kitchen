import { createElement, useState } from "react";
import ProcessRefund from "./processRefund";
import RequestCorrection from "./requestCorrection";
import { ArrowLeft, Clock3, FileText, Info, ReceiptText, TriangleAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Formatter, fullName } from "@/services/utilities";

const RefundDetails = ({
  booking,
  setBooking,
  paymentMethods = [],
  onBack,
}) => {
  const [processing, setProcessing] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const cancellation = booking?.cancellation ?? {};
  const refund = cancellation.refund ?? {};
  const correction = refund.accountCorrection ?? {};
  const needsCorrection = correction.required === true;
  const requestedBy = correction.requestedBy?.fullName
    ? fullName(correction.requestedBy.fullName)
    : null;
  const hasRequestedDate = correction.requestedAt &&
    !Number.isNaN(new Date(correction.requestedAt).getTime());
  const totalPaid = Number(cancellation.totalPaid ?? 0);
  const retainedAmount = Math.min(
    totalPaid,
    Number(cancellation.nonRefundableAmount ?? 0),
  );
  const methodId = refund.method?._id ?? refund.method;
  const methodName =
    refund.method?.name ||
    paymentMethods.find(({ _id }) => _id === methodId)?.name;
  const accountNumber = String(refund.accountNumber ?? "").replace(/\s/g, "");
  const maskedAccount =
    accountNumber.length > 4
      ? `•••• ${accountNumber.slice(-4)}`
      : accountNumber
        ? "•".repeat(accountNumber.length)
        : "Not available";
  const cancelledAt = cancellation.cancelledAt;
  const hasDate = cancelledAt && !Number.isNaN(new Date(cancelledAt).getTime());

  return (
    <>
      <DialogHeader className="shrink-0 space-y-0 border-b bg-muted/20 px-3 py-3 pr-12 text-left sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="size-7 shrink-0 bg-background shadow-none"
              aria-label="Back to pending refunds"
              onClick={onBack}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <DialogTitle className="text-base font-semibold tracking-normal">
              Refund Details
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
          {needsCorrection && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
              Account Update Required
            </span>
          )}
          </div>
        </div>
        <DialogDescription className="sr-only">
          Review the selected booking's cancellation and refund information.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 p-3 sm:p-4">
        <div className="space-y-1 px-0.5">
          <h3 className="text-base font-semibold">
            {booking?.eventType || "Event booking"}
          </h3>
          <p className="break-words text-xs leading-5 text-muted-foreground">
            {[
              booking?.reference,
              booking?.customer?.fullName
                ? fullName(booking.customer.fullName)
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {hasDate && (
            <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
              <Clock3 aria-hidden="true" className="mt-1 size-3 shrink-0" />
              Cancelled on {Formatter.date(cancelledAt, true)}
            </p>
          )}
        </div>

        <Section title="Reason for cancellation" icon={FileText}>
          <p className="whitespace-pre-wrap break-words border-l-2 border-primary/25 pl-3 text-sm leading-6 text-foreground/85">
            {cancellation.reason || "No reason provided."}
          </p>
        </Section>

        <Section title="Refund breakdown" icon={ReceiptText}>
          <dl className="space-y-2.5">
            <Detail
              label="Verified Payments"
              value={Formatter.amount(totalPaid)}
            />
            <Detail
              label="Non-refundable Amount"
              value={`${retainedAmount > 0 ? "−" : ""}${Formatter.amount(retainedAmount)}`}
            />
            <div className="-mx-3 -mb-3 border-t border-primary/10 bg-primary/5 px-3 py-3">
              <Detail
                label="Refund Amount"
                value={Formatter.amount(refund.amount ?? 0)}
                strong
              />
            </div>
          </dl>
        </Section>

        <Section title="Refund destination" icon={Wallet}>
          <dl className="space-y-2.5">
            <Detail
              label="Refund Method"
              value={methodName || "Not available"}
            />
            <Detail
              label="Account Name"
              value={refund.accountName || "Not available"}
            />
            <Detail label="Account Number" value={maskedAccount} />
          </dl>
        </Section>
        {needsCorrection && (
          <section className="overflow-hidden rounded-lg border bg-background">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/15 px-3 py-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                Account Correction Request
              </h4>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Awaiting Customer</span>
            </div>
            <div className="space-y-3 p-3">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Reason for correction</p>
                <p className="whitespace-pre-wrap break-words border-l-2 border-primary/25 pl-3 text-sm leading-6 text-foreground/85">
                  {correction.reason || "No reason provided."}
                </p>
              </div>
              <dl className="space-y-2 border-t border-border/60 pt-2.5">
                <Detail label="Requested by" value={requestedBy || "Not available"} />
                {hasRequestedDate && <Detail label="Requested on" value={Formatter.date(correction.requestedAt, true)} />}
              </dl>
            </div>
            <p className="flex items-start gap-2 border-t bg-muted/10 px-3 py-2 text-xs leading-5 text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Waiting for the customer to update their refund account details before the refund can be processed.
            </p>
          </section>
        )}
      </div>

      <div className="shrink-0 border-t bg-muted/10 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md bg-background text-sm shadow-none"
            onClick={() => setCorrecting(true)}
            disabled={needsCorrection}
          >
            {needsCorrection ? "Correction Requested" : "Request Correction"}
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-md text-sm shadow-none"
            onClick={() => setProcessing(true)}
            disabled={needsCorrection}
          >
            Process Refund
          </Button>
        </div>
      </div>
      <ProcessRefund
        open={processing}
        onOpenChange={setProcessing}
        booking={booking}
        methodName={methodName}
      />
      <RequestCorrection
        open={correcting}
        onOpenChange={setCorrecting}
        booking={booking}
        setBooking={setBooking}
      />
    </>
  );
};

const Section = ({ title, icon: Icon, children }) => (
  <section className="overflow-hidden rounded-lg border bg-background">
    <h4 className="flex items-center gap-2 border-b bg-muted/15 px-3 py-2 text-xs font-semibold text-foreground">
      {createElement(Icon, {
        "aria-hidden": true,
        className: "size-3.5 text-muted-foreground",
      })}
      {title}
    </h4>
    <div className="space-y-3 p-3">{children}</div>
  </section>
);

const Detail = ({ label, value, strong = false }) => (
  <div className="flex items-start justify-between gap-4 text-sm leading-5">
    <dt className={strong ? "font-semibold" : "text-muted-foreground"}>
      {label}
    </dt>
    <dd
      className={`max-w-[60%] break-words text-right font-semibold tabular-nums ${strong ? "text-base text-primary" : ""}`}
    >
      {value}
    </dd>
  </div>
);

export default RefundDetails;
