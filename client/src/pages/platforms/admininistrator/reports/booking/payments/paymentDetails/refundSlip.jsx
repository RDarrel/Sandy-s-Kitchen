import { Formatter, fullName } from "@/services/utilities";
import { CheckCircle2, Clock3, CircleAlert } from "lucide-react";

const TORN_EDGE =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%";

const SOURCE_LABELS = {
  system: "System", phone: "Phone Call", messenger: "Messenger",
  in_person: "In Person", other: "Other",
};

const RefundSlip = ({ refund }) => {
  const completed = refund?.status === "completed";
  const hasAccount = Boolean(refund?.accountProvidedBy);
  const needsCorrection = refund?.accountCorrection?.required === true;
  const StatusIcon = completed ? CheckCircle2 : Clock3;
  const accountNumber = String(refund?.accountNumber ?? "").replace(/\s/g, "");
  const providerName = refund?.accountProvidedByUser?.fullName;
  const totalPaid = Number(refund?.totalPaid ?? 0);
  const retainedAmount = Math.min(totalPaid, Number(refund?.nonRefundableAmount ?? 0));

  return (
    <section
      className="flex min-w-0 flex-col rounded-t-lg border border-b-0 bg-background px-4 pb-6 pt-3"
      style={{ WebkitMask: TORN_EDGE, mask: TORN_EDGE }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Refund slip</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${completed ? "bg-emerald-600" : "bg-amber-500"}`} />
          {completed ? "Completed" : "Pending"}
        </span>
      </div>
      <div className="py-4 text-center">
        <p className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
          {Formatter.amount(refund?.amount ?? 0)}
        </p>
        <div className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium ${completed ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
          <StatusIcon className="size-3.5 shrink-0" />
          <span>{completed ? "Refund completed" : "Awaiting refund processing"}</span>
        </div>
      </div>

      <Section title="Refund Breakdown">
        <Row label="Total Payments Received">{Formatter.amount(totalPaid)}</Row>
        <Row label="Refund Amount">{Formatter.amount(refund?.amount ?? 0)}</Row>
        <Row label="Retained Amount">{Formatter.amount(retainedAmount)}</Row>
      </Section>

      <Section title="Refund Account Information">
        {hasAccount ? (
          <>
            <Row label="Refund Method">{refund?.method?.name || "Unavailable"}</Row>
            <Row label="Account Name">{refund?.accountName || "Unavailable"}</Row>
            <Row label="Account Number">{accountNumber ? `•••• ${accountNumber.slice(-4)}` : "Unavailable"}</Row>
            <Row label="Account Provided By">
              {refund.accountProvidedBy === "customer" ? "Customer" : "Staff"}
              {refund.accountProvidedBy === "staff" && providerName && ` (${fullName(providerName)})`}
            </Row>
            <Row label="Provided At">{formatDate(refund?.accountProvidedAt)}</Row>
            {refund?.accountSource && <Row label="Details Received Via">{SOURCE_LABELS[refund.accountSource] || "Unavailable"}</Row>}
          </>
        ) : (
          <AccountNotice title="Refund account needed">
            Refund account details have not been provided yet. Obtain the customer&apos;s GCash or bank account details before processing the refund.
          </AccountNotice>
        )}
        {hasAccount && needsCorrection && !completed && (
          <AccountNotice title="Account Correction Required">
            {refund.accountCorrection?.reason || "The customer needs to correct their refund account details before processing."}
          </AccountNotice>
        )}
      </Section>

      <Section title="Refund Information">
        <Row label="Refund Reason">{refund?.cancellationReason || "Booking cancellation"}</Row>
        {completed && refund?.reference && <Row label="Refund Reference">{refund.reference}</Row>}
      </Section>

      {completed && (
        <Section title="Processing Information">
          <Row label="Processed By">{refund?.processedBy?.fullName ? fullName(refund.processedBy.fullName) : "Unavailable"}</Row>
          <Row label="Refunded At">{formatDate(refund?.refundedAt)}</Row>
        </Section>
      )}
      <p className="mt-auto border-t border-dashed pt-3 text-center text-xs leading-5 text-muted-foreground">
        Keep this refund record for your reference.
      </p>
    </section>
  );
};

const formatDate = (value) => value ? Formatter.date(value, true) : "Unavailable";

const Section = ({ title, children }) => (
  <div className="border-t border-dashed py-3">
    <h3 className="mb-2.5 text-xs font-semibold">{title}</h3>
    <dl className="space-y-2 text-sm">{children}</dl>
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 max-w-[60%] break-words text-right tabular-nums">{children}</dd>
  </div>
);

const AccountNotice = ({ title, children }) => (
  <div className="flex items-start gap-2 rounded-md bg-muted/30 p-2 text-xs">
    <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
    <div className="space-y-1">
      <p className="font-medium">{title}</p>
      <p className="leading-5 text-muted-foreground">{children}</p>
    </div>
  </div>
);

export default RefundSlip;
