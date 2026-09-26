import { Wallet } from "lucide-react";
import { PAYMENT_SUMMARY_STYLES, PAYMENT_TEXT_STYLES } from "../../constant";
import { Formatter } from "@/services/utilities";

const PAYMENT_SUMMARY_TONES = {
  estimate: {
    text: "text-slate-700",
    summary: "border-slate-200 bg-slate-50/70",
  },
  deposit: {
    text: "text-blue-700",
    summary: "border-blue-200 bg-blue-50/70",
  },
  review: {
    text: "text-amber-700",
    summary: "border-amber-300 bg-amber-50",
  },
  balance: {
    text: "text-blue-700",
    summary: "border-blue-200 bg-blue-50/70",
  },
  paid: {
    text: "text-emerald-700",
    summary: "border-emerald-200 bg-emerald-50/70",
  },
};

const PaymentSummary = ({ booking }) => {
  const summary = getPaymentSummary(booking);
  const tone = PAYMENT_SUMMARY_TONES[summary.tone] || {};
  const statusStyle =
    tone.text || PAYMENT_TEXT_STYLES[summary.status] || "text-foreground";
  const summaryStyle =
    tone.summary ||
    PAYMENT_SUMMARY_STYLES[summary.status] ||
    "border-border bg-muted/25";

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-2 py-1.5 ${summaryStyle}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Wallet className={`size-3.5 shrink-0 ${statusStyle}`} />

        <div className="min-w-0">
          <p className={`truncate font-medium leading-4 ${statusStyle}`}>
            {summary.label}
          </p>

          <p className="truncate text-[11px] leading-4 text-muted-foreground">
            {summary.description}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold leading-4 text-foreground">
          {summary.amount}
        </p>

        {summary.amountNote ? (
          <p className="text-[11px] leading-4 text-muted-foreground">
            {summary.amountNote}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentSummary;

const getPaymentSummary = (booking) => {
  const total = toAmount(booking?.pricing?.total);
  const requiredDeposit = toAmount(booking?.terms?.requiredDeposit);
  const depositDeadline = formatDeadline(booking?.terms?.depositDeadline);
  const payments = getPayments(booking.payments);

  const { verifiedAmount, pendingAmount, pendingCount } = payments.reduce(
    (summary, payment) => {
      const status = normalizeStatus(payment?.status);
      const amount = toAmount(payment?.amount);

      if (status === "verified") {
        summary.verifiedAmount += amount;
      }

      if (status === "pending") {
        summary.pendingAmount += amount;
        summary.pendingCount += 1;
      }

      return summary;
    },
    {
      verifiedAmount: 0,
      pendingAmount: 0,
      pendingCount: 0,
    },
  );

  const balance = Math.max(total - verifiedAmount, 0);
  const isFullyPaid = total > 0 && verifiedAmount >= total;
  const isApproved = normalizeStatus(booking?.status) === "approved";
  const isPendingBooking = normalizeStatus(booking?.status) === "pending";

  if (isFullyPaid) {
    return {
      tone: "paid",
      status: "paid",
      label: "Fully paid",
      amount: Formatter.amount(total),
      description: "No remaining balance",
    };
  }

  if (pendingCount > 0) {
    const hasMultiplePending = pendingCount > 1;

    return {
      tone: "review",
      status: "pending",
      label: hasMultiplePending ? "Payments to review" : "Payment to review",
      amount: Formatter.amount(pendingAmount),
      description: getPendingDescription({
        pendingCount,
        verifiedAmount,
        balance,
      }),
    };
  }

  if (isApproved && verifiedAmount === 0) {
    return {
      tone: "deposit",
      status: "pending",
      label: "Required down payment",
      amount: Formatter.amount(requiredDeposit),
      description: `${Formatter.amount(total)} total${depositDeadline ? ` - Due ${depositDeadline}` : ""}`,
    };
  }

  if (verifiedAmount > 0) {
    return {
      tone: "balance",
      status: "partial",
      label: "Remaining balance",
      amount: Formatter.amount(balance),
      description: `${Formatter.amount(verifiedAmount)} paid - ${Formatter.amount(total)} total`,
    };
  }

  return {
    tone: "estimate",
    status: isPendingBooking ? "pending" : "unpaid",
    label: "Estimated total",
    amount: Formatter.amount(total),
    description: "Subject to approval",
  };
};

const getPendingDescription = ({ pendingCount, verifiedAmount, balance }) => {
  if (pendingCount > 1) {
    return verifiedAmount > 0
      ? `${pendingCount} submissions - ${Formatter.amount(verifiedAmount)} verified`
      : `${pendingCount} submissions - Awaiting verification`;
  }

  return verifiedAmount > 0
    ? `${Formatter.amount(verifiedAmount)} verified - ${Formatter.amount(balance)} remaining`
    : "Awaiting verification";
};

const formatDeadline = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}, ${Formatter.time(date)}`;
};

const normalizeStatus = (status) =>
  typeof status === "string" ? status.toLowerCase() : "";

const getPayments = (booking) => {
  return Array.isArray(booking?.payments) ? booking.payments : [];
};

const toAmount = (amount) => {
  const value = Number(amount);

  return Number.isFinite(value) ? value : 0;
};
