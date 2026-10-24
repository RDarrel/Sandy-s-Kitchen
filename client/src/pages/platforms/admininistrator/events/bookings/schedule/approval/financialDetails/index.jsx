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
  Clock3,
  CreditCard,
  ReceiptText,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import PaymentDetails from "./paymentDetails";
import PaymentSummary from "@/pages/platforms/customer/myBookings/details/financial/summary";
import RefundDetails from "@/pages/platforms/customer/myBookings/details/financial/refundDetails";
import { getPaymentSummary } from "@/pages/platforms/customer/myBookings/utils";

const FinancialDetails = ({ booking = {} }) => {
  const payments = booking?.payments || [];
  const paymentSummary = getPaymentSummary(booking);

  return (
    <aside className="space-y-3">
      <PaymentSummary booking={booking} payment={paymentSummary} />
      <RefundDetails booking={booking} readOnly />
      <PaymentHistory booking={booking} payments={payments} />
      <TermsSummary terms={booking?.terms} />
    </aside>
  );
};

export default FinancialDetails;

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

const getPaymentMethodName = (payment = {}) =>
  capitalizeText(payment?.method?.name || payment?.method || "Payment method");

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
