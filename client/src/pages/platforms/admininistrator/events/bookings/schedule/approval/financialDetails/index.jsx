import { Button } from "@/components/ui/button";
import { Frame, FrameHeader, FramePanel } from "@/components/reui/frame";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { Formatter } from "@/services/utilities";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  ReceiptText,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import PaymentDetails from "./paymentDetails";

const FinancialDetails = ({ booking = {}, payment = {} }) => {
  const payments = booking?.payments || [];
  const paymentSummary = getDetailedPaymentSummary(booking, payment);
  const serviceRows = getPaymentBreakdownRows(booking?.pricing);

  return (
    <aside className="space-y-3">
      <PaymentSummary payment={paymentSummary} serviceRows={serviceRows} />
      <PaymentHistory booking={booking} payments={payments} />
      <TermsSummary terms={booking?.terms} />
    </aside>
  );
};

export default FinancialDetails;

const PaymentSummary = ({ payment, serviceRows }) => {
  const isFullyPaid = payment.total > 0 && payment.balance === 0;
  const hasPendingPayment = Number(payment.pendingAmount || 0) > 0;
  const displayedBalance = hasPendingPayment
    ? Math.max(
        Number(payment.balance || 0) - Number(payment.pendingAmount || 0),
        0,
      )
    : Number(payment.balance || 0);

  return (
    <FramedCard
      header={
        <FrameTitle
          title="Payment summary"
          trailing={<CreditCard className="size-3.5 text-muted-foreground" />}
        />
      }
    >
      <div className="p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isFullyPaid
                ? "Status"
                : hasPendingPayment
                  ? "Balance after verification"
                  : "Remaining balance"}
            </p>

            {isFullyPaid ? (
              <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Fully paid
              </p>
            ) : (
              <p className="mt-1 text-xl font-semibold leading-none tracking-tight">
                {Formatter.amount(displayedBalance)}
              </p>
            )}
          </div>

          <p className="shrink-0 text-right text-[11px] text-muted-foreground">
            of {Formatter.amount(payment.total)} total
          </p>
        </div>

        <div className="my-3 border-t" />

        <div className="space-y-3">
          {serviceRows.map((service) => (
            <PaymentServiceBreakdown key={service.label} service={service} />
          ))}

          <div className="border-t pt-2">
            <AmountRow label="Total amount" value={payment.total} strong />
          </div>

          {payment.verifiedAmount > 0 && (
            <AmountRow
              label="Verified payments"
              value={payment.verifiedAmount}
              positive
            />
          )}

          {payment.pendingAmount > 0 && (
            <>
              <AmountRow
                label="Pending verification"
                value={payment.pendingAmount}
                pending
              />

              <p className="pt-1 text-[10px] leading-4 text-muted-foreground">
                Balance updates after the payment is verified.
              </p>
            </>
          )}
        </div>
      </div>
    </FramedCard>
  );
};

const PaymentHistory = ({ booking, payments = [] }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const sortedPayments = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [payments]);

  return (
    <>
      <FramedCard
        header={
          <FrameTitle
            title="Payment history"
            afterTitle={
              payments.length > 0 ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold leading-none text-muted-foreground">
                  {payments.length}
                </span>
              ) : null
            }
            trailing={
              <ReceiptText className="size-3.5 text-muted-foreground" />
            }
          />
        }
      >
        {payments.length > 0 ? (
          <div className="p-3">
            <PaymentHistoryTimeline
              payments={sortedPayments}
              onViewPayment={setSelectedPayment}
            />
          </div>
        ) : (
          <div className="px-4 py-5 text-center">
            <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-3.5 text-muted-foreground" />
            </div>

            <p className="mt-2 text-xs font-medium">No payments yet</p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Submitted payments will appear here.
            </p>
          </div>
        )}
      </FramedCard>

      <PaymentDetails
        isOpen={Boolean(selectedPayment)}
        booking={booking}
        payment={selectedPayment}
        setIsOpen={() => setSelectedPayment(null)}
      />
    </>
  );
};

const PaymentHistoryTimeline = ({ payments = [], onViewPayment }) => (
  <div className="payment-timeline-scroll max-h-72 overflow-y-auto pr-2 pl-0.5">
    <Timeline defaultValue={payments.length} className="gap-0">
      {payments.map((payment, index) => (
        <TimelineItem
          key={payment?._id || index}
          step={index + 1}
          className="group-data-[orientation=vertical]/timeline:ms-7 group-data-[orientation=vertical]/timeline:not-last:pb-4"
        >
          <TimelineHeader>
            <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem)] group-data-[orientation=vertical]/timeline:w-px group-data-[orientation=vertical]/timeline:translate-y-5" />

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <TimelineTitle className="min-w-fit text-[13px] font-semibold">
                    {Formatter.amount(payment?.amount)}
                  </TimelineTitle>

                  <PaymentStatus status={payment?.status} />
                </div>

                <TimelineContent className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 text-xs">
                  <span className="min-w-0 truncate">
                    {getPaymentMethodName(payment)}
                  </span>

                  <span className="text-muted-foreground/60">·</span>

                  <span className="shrink-0">
                    {capitalizeText(
                      payment?.type === "deposit"
                        ? "Down Payment"
                        : payment?.type,
                    )}
                  </span>
                </TimelineContent>
              </div>

              {onViewPayment && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-6 shrink-0 rounded-md"
                  onClick={() => onViewPayment(payment)}
                  aria-label="View payment details"
                >
                  <ArrowUpRight className="size-3.5" />
                </Button>
              )}
            </div>

            <PaymentTimelineIndicator status={payment?.status} />
          </TimelineHeader>

          <TimelineDate className="mb-0 mt-1 text-[11px]">
            {formatDateTime(payment?.paidAt || payment?.createdAt)}
          </TimelineDate>
        </TimelineItem>
      ))}
    </Timeline>
  </div>
);

const TermsSummary = ({ terms }) => (
  <FramedCard
    header={
      <FrameTitle
        title="Booking terms"
        trailing={<Clock3 className="size-3.5 text-muted-foreground" />}
      />
    }
  >
    {terms ? (
      <div className="space-y-2 p-3">
        <Term
          label="Required down payment"
          value={Formatter.amount(terms.requiredDeposit)}
        />
        <Term
          label="Down payment due"
          value={formatDateTime(terms.depositDeadline)}
        />
        <Term label="Full payment due" value={formatDate(terms.balanceDueAt)} />
        <Term
          label="Cancellation deadline"
          value={formatDate(terms.cancellationDeadline)}
        />
      </div>
    ) : (
      <div className="px-4 py-5 text-center">
        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted">
          <Clock3 className="size-3.5 text-muted-foreground" />
        </div>

        <p className="mt-2 text-xs font-medium">Terms not available yet</p>

        <p className="mx-auto mt-0.5 max-w-[220px] text-[10px] leading-4 text-muted-foreground">
          Booking terms will be available after approval.
        </p>
      </div>
    )}
  </FramedCard>
);

const FrameTitle = ({ icon: Icon, title, afterTitle, trailing }) => (
  <div className="flex min-w-0 items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2">
      {Icon && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background">
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold leading-5">{title}</h2>
          {afterTitle}
        </div>
      </div>
    </div>

    {trailing && <div className="flex shrink-0 items-center">{trailing}</div>}
  </div>
);

const FramedCard = ({ header, children }) => (
  <Frame className="w-full" spacing="none">
    {header && (
      <FrameHeader className="min-h-0 px-3 py-1">{header}</FrameHeader>
    )}
    <FramePanel className="p-0">{children}</FramePanel>
  </Frame>
);

const PaymentServiceBreakdown = ({ service }) => (
  <div>
    <AmountRow label={service.label} value={service.total} strong />

    <div className="ml-2 mt-1.5 space-y-1.5 border-l pl-3">
      {service.guestCharge > 0 && (
        <PaymentChargeRow
          label="Extra guests"
          detail={`${service.guests.extra} pax`}
          value={service.guestCharge}
        />
      )}

      {service.durationCharge > 0 && (
        <PaymentChargeRow
          label="Extra hours"
          detail={formatHours(service.duration.extra)}
          value={service.durationCharge}
        />
      )}
    </div>
  </div>
);

const PaymentChargeRow = ({ label, detail, value }) => (
  <div className="relative flex items-start justify-between gap-3 text-xs">
    <span className="absolute -left-3 top-2 h-px w-2.5 bg-border" />

    <span className="text-muted-foreground">
      <span>{label}</span>
      <span className="ml-1 text-[11px]">{detail}</span>
    </span>

    <span>{Formatter.amount(value || 0)}</span>
  </div>
);

const AmountRow = ({
  label,
  value,
  detail,
  strong = false,
  positive = false,
  pending = false,
}) => (
  <div className="flex items-center justify-between gap-3 text-xs">
    <span
      className={
        strong ? "font-semibold text-foreground" : "text-muted-foreground"
      }
    >
      {detail ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          {label}
          <span className="text-[11px] font-normal text-muted-foreground/80">
            {detail}
          </span>
        </span>
      ) : (
        label
      )}
    </span>

    <span
      className={[
        strong ? "font-semibold" : "font-medium",
        positive ? "text-emerald-700 dark:text-emerald-400" : "",
        pending ? "text-amber-700 dark:text-amber-400" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {Formatter.amount(value || 0)}
    </span>
  </div>
);

const Term = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[58%] text-right font-medium">{value || "-"}</span>
  </div>
);

const PAYMENT_STATUS_DOT = {
  verified: "bg-emerald-600",
  pending: "bg-amber-600",
  voided: "bg-red-600",
  refunded: "bg-slate-400",
};

const PAYMENT_TIMELINE_STATUS = {
  verified: {
    icon: Check,
    className: "border-none bg-emerald-600 text-white",
  },
  pending: {
    icon: Clock3,
    className: "border-none bg-amber-500 text-white",
  },
  voided: {
    icon: X,
    className: "border-none bg-red-600 text-white",
  },
  refunded: {
    icon: CreditCard,
    className: "border-none bg-slate-400 text-white",
  },
};

const PaymentTimelineIndicator = ({ status }) => {
  const meta =
    PAYMENT_TIMELINE_STATUS[status] || PAYMENT_TIMELINE_STATUS.refunded;
  const Icon = meta.icon;

  return (
    <TimelineIndicator
      className={`flex size-5 items-center justify-center group-data-[orientation=vertical]/timeline:-left-5 ${meta.className}`}
    >
      <Icon className="size-3" />
    </TimelineIndicator>
  );
};

const PaymentStatus = ({ status }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
    <span
      className={`size-1.5 rounded-full ${
        PAYMENT_STATUS_DOT[status] || PAYMENT_STATUS_DOT.refunded
      }`}
    />
    {capitalizeText(status === "voided" ? "rejected" : status)}
  </span>
);

const getDetailedPaymentSummary = (booking, fallbackPayment = {}) => {
  const payments = booking?.payments || [];
  const total = Number(fallbackPayment?.total || booking?.pricing?.total || 0);
  const downPayment = Number(booking?.terms?.requiredDeposit || 0);

  const verifiedPayments = payments.filter(
    ({ status }) => status === "verified",
  );
  const pendingPayments = payments.filter(({ status }) => status === "pending");
  const voidedPayments = payments.filter(({ status }) => status === "voided");

  const verifiedAmount =
    verifiedPayments.reduce(
      (sum, item) => sum + Number(item?.amount || 0),
      0,
    ) || Number(fallbackPayment?.received || 0);

  const pendingAmount = pendingPayments.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0,
  );

  const balance = Math.max(total - verifiedAmount, 0);

  return {
    total,
    downPayment,
    verifiedAmount,
    pendingAmount,
    balance,
    verifiedPayments,
    pendingPayments,
    voidedPayments,
  };
};

const getPaymentBreakdownRows = (pricing = {}) =>
  [
    getServicePricingBreakdown("Catering Package", pricing?.catering),
    getServicePricingBreakdown("Venue", pricing?.venue),
  ].filter(Boolean);

const getServicePricingBreakdown = (label, pricing = {}) => {
  const total = Number(pricing?.total || 0);

  if (total <= 0) {
    return null;
  }

  const guests = getPricingMetric(pricing?.guests);
  const duration = getPricingMetric(pricing?.duration);
  const guestCharge =
    guests.extra > 0 ? Number(pricing?.guests?.charge || 0) : 0;
  const durationCharge =
    duration.extra > 0 ? Number(pricing?.duration?.charge || 0) : 0;
  const baseAmount = Number(pricing?.basePrice || 0);

  return {
    label,
    total:
      baseAmount > 0
        ? baseAmount
        : Math.max(total - guestCharge - durationCharge, 0),
    guests,
    duration,
    guestCharge,
    durationCharge,
  };
};

const getPricingMetric = (breakdown = {}) => {
  const included = Number(breakdown?.included || 0);
  const booked = Number(breakdown?.booked || 0);
  const extra = Number(breakdown?.extra || 0);
  const computedExtra = Math.max(booked - included, 0);

  return {
    extra: extra > 0 ? extra : computedExtra,
  };
};

const getPaymentMethodName = (payment = {}) =>
  capitalizeText(payment?.method?.name || payment?.method || "Payment method");

const formatHours = (hours) => `${hours} hr${hours === 1 ? "" : "s"}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const capitalizeText = (value = "") =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
