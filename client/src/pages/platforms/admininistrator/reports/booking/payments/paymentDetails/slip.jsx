import { Formatter, fullName } from "@/services/utilities";
import { CheckCircle2, Clock3, MessageSquareText, XCircle } from "lucide-react";
import { formatPaymentType } from "../../../../events/bookings/schedule/approval/financialDetails/utils";

const TORN_EDGE =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%";

const STATUS_META = {
  verified: {
    label: "Verified",
    message: "Payment verified",
    icon: CheckCircle2,
    dotClassName: "bg-emerald-600",
    textClassName: "text-emerald-700 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    message: "Pending verification",
    icon: Clock3,
    dotClassName: "bg-amber-500",
    textClassName: "text-amber-700 dark:text-amber-400",
  },
  voided: {
    label: "Rejected",
    message: "Payment could not be verified",
    icon: XCircle,
    dotClassName: "bg-red-600",
    textClassName: "text-red-700 dark:text-red-400",
  },
};

const PaymentSlip = ({ payment, paymentAmount }) => {
  const status = STATUS_META[payment?.status] || STATUS_META.pending;
  const StatusIcon = status.icon;

  return (
    <section
      className="flex min-w-0 flex-col rounded-t-lg border border-b-0 bg-background px-4 pb-6 pt-3"
      style={{ WebkitMask: TORN_EDGE, mask: TORN_EDGE }}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Payment slip</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${status.dotClassName}`} />
          {status.label}
        </span>
      </div>
      <div className="py-4 text-center">
        <p className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
          {Formatter.amount(paymentAmount)}
        </p>
        <div
          className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium ${status.textClassName}`}
        >
          <StatusIcon className="size-3.5 shrink-0" />
          <span>{status.message}</span>
        </div>
      </div>

      <SlipSection title="Transaction Information">
        <Row label="Payment Method">
          <span className="font-semibold capitalize">
            {payment?.method?.name || "Unavailable"}
          </span>
        </Row>
        <Row label="Payment Type">{formatPaymentType(payment?.type)}</Row>
        {payment?.reference && (
          <Row label="Payment Reference">
            <span className="select-all break-all font-mono font-semibold">
              {payment.reference}
            </span>
          </Row>
        )}
        <Row label="Submitted">
          {payment?.createdAt
            ? Formatter.date(payment.createdAt, true)
            : "Unavailable"}
        </Row>
      </SlipSection>

      <SlipSection title="Verification Information">
        <Row label="Reviewed By">
          {payment?.reviewedBy?.fullName
            ? fullName(payment.reviewedBy.fullName)
            : payment?.status === "pending"
              ? "Awaiting review"
              : "Unavailable"}
        </Row>
        <Row label="Reviewed At">
          {payment?.reviewedAt
            ? Formatter.date(payment.reviewedAt, true)
            : payment?.status === "pending"
              ? "Not yet reviewed"
              : "Unavailable"}
        </Row>
      </SlipSection>

      {Boolean(payment?.notes?.trim()) && (
        <Notice title="Customer note" icon={MessageSquareText}>
          {payment.notes}
        </Notice>
      )}

      {payment?.status === "voided" &&
        Boolean(payment?.rejectionReason?.trim()) && (
          <Notice title="Reason for rejection" icon={XCircle} tone="danger">
            {payment.rejectionReason}
          </Notice>
        )}

      <p className="mt-auto border-t border-dashed pt-3 text-center text-xs leading-5 text-muted-foreground">
        Keep this payment record for your reference.
      </p>
    </section>
  );
};

export default PaymentSlip;

const SlipSection = ({ title, children }) => (
  <div className="border-t border-dashed py-3">
    <h3 className="mb-2.5 text-xs font-semibold">{title}</h3>
    <dl className="space-y-2 text-sm">{children}</dl>
  </div>
);

const Row = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 max-w-[60%] break-words text-right tabular-nums">
      {children}
    </dd>
  </div>
);

const Notice = ({ title, icon, tone = "default", children }) => {
  const Icon = icon;
  return (
    <div
      className={`border-t border-dashed py-3 text-xs ${
        tone === "danger" ? "text-red-700 dark:text-red-400" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        <Icon className="size-3.5 shrink-0" />
        <span>{title}</span>
      </div>
      <p className="mt-1.5 whitespace-pre-line break-words leading-5 text-foreground">
        {children}
      </p>
    </div>
  );
};
