import { Formatter, fullName } from "@/services/utilities";
import { CheckCircle2, Clock3, MessageSquareText, XCircle } from "lucide-react";
import { formatPaymentType } from "./utils";

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

const PaymentSlip = ({
  payment,
  paymentAmount,
  verifiedAmount,
  totalAmount,
  balanceAfterPayment,
  projectedBalance,
}) => {
  const status = STATUS_META[payment?.status] || STATUS_META.pending;
  const StatusIcon = status.icon;

  const methodName =
    typeof payment?.method === "object"
      ? payment?.method?.name
      : formatPaymentType(payment?.method);

  const balance = getBalanceDetails({
    payment,
    balanceAfterPayment,
    projectedBalance,
  });

  const hasCustomerNote = Boolean(payment?.notes?.trim());
  const hasRejectionReason =
    payment?.status === "voided" && Boolean(payment?.rejectionReason?.trim());

  return (
    <section
      className="flex min-w-0 flex-col rounded-t-lg border border-b-0 bg-background px-4 pb-6 pt-3"
      style={{
        WebkitMask: TORN_EDGE,
        mask: TORN_EDGE,
      }}
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

      <SlipRows>
        <Row label="Method">
          <p className="font-semibold">{methodName || "Payment method"}</p>
        </Row>

        <Row label="Type">{formatPaymentType(payment?.type)}</Row>

        <Row label="Transaction reference">
          <span className="flex min-w-0 items-start justify-end gap-1">
            <span className="select-all break-all font-mono font-semibold">
              {payment?.reference || "-"}
            </span>
          </span>
        </Row>

        <Row label="Submitted">{Formatter.date(payment?.createdAt, true)}</Row>

        {payment?.reviewedAt && (
          <>
            <Row label="Reviewed">
              {Formatter.date(payment.reviewedAt, true)}
            </Row>
            <Row label="Reviewed by">
              {fullName(payment?.reviewedBy?.fullName)}
            </Row>
          </>
        )}
      </SlipRows>

      <SlipRows>
        <Row label="Booking total">{Formatter.amount(totalAmount)}</Row>

        <Row label="Verified before this payment">
          {Formatter.amount(verifiedAmount)}
        </Row>

        <Row label="This payment">{Formatter.amount(paymentAmount)}</Row>

        <Row label={balance.label} strong>
          {Formatter.amount(balance.value)}
        </Row>
      </SlipRows>

      {hasCustomerNote && (
        <Notice title="Customer note" icon={MessageSquareText}>
          {payment.notes}
        </Notice>
      )}

      {hasRejectionReason && (
        <Notice
          title="Reason for rejection"
          icon={XCircle}
          tone="danger"
          separated={hasCustomerNote}
        >
          {payment.rejectionReason}
        </Notice>
      )}

      <p
        className={`mt-auto border-t border-dashed pt-3 text-center text-xs font-medium leading-5 ${status.textClassName}`}
      >
        {getFooterMessage(payment)}
      </p>
    </section>
  );
};

export default PaymentSlip;

const SlipRows = ({ children }) => (
  <dl className="space-y-2 border-t border-dashed py-3 text-sm">{children}</dl>
);

const Row = ({ label, strong = false, children }) => (
  <div
    className={`flex items-start justify-between gap-3 ${
      strong ? "pt-1 font-semibold" : ""
    }`}
  >
    <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>

    <dd className="min-w-0 max-w-[60%] break-words text-right tabular-nums">
      {children}
    </dd>
  </div>
);

const Notice = ({
  title,
  icon: Icon,
  tone = "default",
  separated = false,
  children,
}) => (
  <div
    className={`border-t border-dashed py-3 text-xs ${
      separated ? "mt-0" : ""
    } ${tone === "danger" ? "text-red-700 dark:text-red-400" : ""}`}
  >
    <div className="flex items-center gap-1.5 font-semibold">
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span>{title}</span>
    </div>

    <p className="mt-1.5 whitespace-pre-line leading-5 text-foreground">
      {children}
    </p>
  </div>
);

const getBalanceDetails = ({
  payment,
  balanceAfterPayment,
  projectedBalance,
}) => {
  if (payment?.status === "pending") {
    return {
      label: "Balance after verification",
      value: projectedBalance,
    };
  }

  if (payment?.status === "verified") {
    return {
      label: "Balance after verification",
      value: balanceAfterPayment,
    };
  }

  if (payment?.status === "voided") {
    return {
      label: "Balance unchanged",
      value: balanceAfterPayment,
    };
  }

  return {
    label: "Remaining balance",
    value: balanceAfterPayment,
  };
};

const getFooterMessage = (payment) => {
  const isDownPayment = ["deposit", "down_payment"].includes(payment?.type);

  if (payment?.status === "verified") {
    return isDownPayment
      ? "This down payment has been verified and the booking is confirmed."
      : "This payment has been verified and applied to the booking balance.";
  }

  if (payment?.status === "voided") {
    return isDownPayment
      ? "This down payment was not verified and was not applied to the booking."
      : "This payment was not verified and was not applied to the booking balance.";
  }

  return isDownPayment
    ? "Verifying this down payment will confirm the booking."
    : "Verifying this payment will apply it to the booking balance.";
};
