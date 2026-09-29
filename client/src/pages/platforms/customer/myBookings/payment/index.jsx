import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ImagePlus,
  Smartphone,
} from "lucide-react";

import { BROWSE as BROWSE_PAYMENT_METHODS } from "@/services/redux/slices/events/paymentMethods";
import { GET_BOOKING_PAYMENT } from "@/services/redux/slices/events/bookings";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";

const TYPE_META = {
  cash: {
    label: "Cash",
    icon: Banknote,
  },
  e_wallet: {
    label: "E-wallet",
    icon: Smartphone,
  },
  bank_transfer: {
    label: "Bank transfer",
    icon: Building2,
  },
};

const Payment = () => {
  const { collections: paymentMethods, isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);

  const { selected, isLoadingBookingPayment } = useSelector(
    ({ bookings }) => bookings,
  );

  const { reference } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  useEffect(() => {
    dispatch(BROWSE_PAYMENT_METHODS());
    dispatch(GET_BOOKING_PAYMENT(reference));
  }, [dispatch, reference]);

  const activeMethods = useMemo(
    () => paymentMethods.filter(({ isActive }) => isActive),
    [paymentMethods],
  );

  useEffect(() => {
    if (!selectedMethodId && activeMethods.length > 0) {
      setSelectedMethodId(activeMethods[0]?._id);
    }
  }, [activeMethods, selectedMethodId]);

  const selectedMethod = useMemo(
    () =>
      activeMethods.find(({ _id }) => _id === selectedMethodId) ||
      activeMethods[0] ||
      null,
    [activeMethods, selectedMethodId],
  );

  const payment = useMemo(() => getPaymentSummary(selected), [selected]);

  const suggestedPaymentAmount =
    payment.requiredDeposit > 0 ? payment.requiredDeposit : payment.balance;

  useEffect(() => {
    if (!amountPaid && suggestedPaymentAmount > 0) {
      setAmountPaid(String(suggestedPaymentAmount));
    }
  }, [amountPaid, suggestedPaymentAmount]);

  const paidAmount = Number(amountPaid || 0);

  const belowDeposit =
    payment.requiredDeposit > 0 &&
    paidAmount > 0 &&
    paidAmount < payment.requiredDeposit;

  const exceedsBalance = payment.balance > 0 && paidAmount > payment.balance;

  const invalidAmount = paidAmount <= 0 || belowDeposit || exceedsBalance;

  const remainingAfterPayment = Math.max(payment.balance - paidAmount, 0);

  const isLoading = isLoadingBookingPayment || isLoadingMethods;

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-3 md:px-4 md:py-4">
      {isLoading ? (
        <PaymentSkeleton />
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ================================================================ */}
          {/* LEFT COLUMN                                                      */}
          {/* ================================================================ */}

          <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
            {/* Booking title */}
            <BookingHeader
              booking={selected}
              fallbackReference={reference}
              onBack={() => navigate(-1)}
            />

            {/* Payment methods */}
            <div className="border-t bg-muted/5 px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold">Payment method</h2>

                  {activeMethods.length > 0 && (
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary">
                      {activeMethods.length} available
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                  Choose where you want to send your payment.
                </p>
              </div>

              <div className="mt-2.5">
                {activeMethods.length > 0 ? (
                  <PaymentMethods
                    methods={activeMethods}
                    selectedMethodId={selectedMethod?._id}
                    setSelectedMethodId={setSelectedMethodId}
                  />
                ) : (
                  <div className="rounded-md border border-dashed bg-muted/10 px-3 py-5 text-center text-xs text-muted-foreground">
                    No active payment methods available.
                  </div>
                )}
              </div>
            </div>

            {/* Selected method */}
            {selectedMethod && (
              <div className="border-t px-4 py-3.5">
                <MethodDetails method={selectedMethod} />
              </div>
            )}

            {/* Payment form */}
            <div className="border-t bg-muted/5 px-4 py-3.5">
              <PaymentForm
                amountPaid={amountPaid}
                setAmountPaid={setAmountPaid}
                payment={payment}
                method={selectedMethod}
                paidAmount={paidAmount}
                invalidAmount={invalidAmount}
                belowDeposit={belowDeposit}
                exceedsBalance={exceedsBalance}
                remainingAfterPayment={remainingAfterPayment}
              />
            </div>
          </section>

          {/* ================================================================ */}
          {/* RIGHT COLUMN                                                     */}
          {/* ================================================================ */}

          <aside className="lg:sticky lg:top-4">
            <PaymentSummary
              payment={payment}
              method={selectedMethod}
              paidAmount={paidAmount}
              invalidAmount={invalidAmount}
              remainingAfterPayment={remainingAfterPayment}
            />
          </aside>
        </div>
      )}
    </main>
  );
};

export default Payment;

/* -------------------------------------------------------------------------- */
/*                               BOOKING HEADER                               */
/* -------------------------------------------------------------------------- */

const BookingHeader = ({ booking, fallbackReference, onBack }) => {
  return (
    <div className="bg-background px-4 py-3">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-1 size-7 shrink-0 p-0 text-muted-foreground"
            onClick={onBack}
            aria-label="Back to my bookings"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight">
            Complete your payment
          </h1>

          <span className="shrink-0 rounded-md border bg-muted/20 px-2 py-1 font-mono text-[10px] text-muted-foreground">
            #{booking?.reference || fallbackReference}
          </span>
        </div>

        <div className="hidden">
          <span className="font-medium text-foreground/80">
            {booking?.eventType || "Event booking"}
          </span>

          <span>•</span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDate(booking?.date)}
          </span>

          <span className="font-mono">
            #{booking?.reference || fallbackReference}
          </span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              PAYMENT METHODS                               */
/* -------------------------------------------------------------------------- */

const PaymentMethods = ({ methods, selectedMethodId, setSelectedMethodId }) => {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max min-w-full gap-1.5">
        {methods.map((method) => {
          const selected = method._id === selectedMethodId;
          const methodType = TYPE_META[method.type]?.label || "Payment method";

          return (
            <button
              key={method._id}
              type="button"
              onClick={() => setSelectedMethodId(method._id)}
              className={`flex h-12 w-44 shrink-0 items-center gap-2 rounded-md border px-2 text-left transition ${
                selected
                  ? "border-foreground/20 bg-muted/40 shadow-xs"
                  : "bg-background hover:border-foreground/20 hover:bg-muted/20"
              }`}
            >
              <MethodLogo method={method} className="size-9 p-1.5" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold text-foreground">
                  {method.name}
                </span>
                <span className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                  {method.accountName || methodType}
                </span>
              </span>

              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-transparent"
                }`}
              >
                <Check className="size-2.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               METHOD DETAILS                               */
/* -------------------------------------------------------------------------- */

const MethodDetails = ({ method }) => {
  const isCash = method.type === "cash";
  const qrUrl = method.qrImgId
    ? Cloudinary.getPaymentMethodImg(method.qrImgId, method._id, "qr")
    : "";

  return (
    <div>
      <SectionHeader
        title="Payment details"
        description={
          isCash
            ? "Complete your payment directly at Sandy's Kitchenette."
            : "Scan the QR code or use the account details below."
        }
      />

      <div className="mt-2.5 overflow-hidden rounded-md border border-border/70 bg-muted/5">
        {isCash ? (
          <div className="flex items-start gap-2.5 px-2.5 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
              <Banknote className="size-4 text-muted-foreground" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="rounded-md border border-border/70 bg-background px-2">
                <CompactDetail label="Method" value={method.name} />
                <CompactDetail label="Type" value="Cash payment" />
              </div>

              {method.instructions && (
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  {method.instructions}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid items-start gap-2 px-2.5 py-2 sm:grid-cols-[7.25rem_minmax(0,1fr)]">
            {qrUrl ? (
              <a
                href={qrUrl}
                download={`${method.name}-qr-code`}
                target="_blank"
                rel="noreferrer"
                className="flex h-full min-h-[7.25rem] w-[7.25rem] items-center justify-center overflow-hidden rounded-md border border-border/70 bg-background p-1.5 transition hover:border-primary/30"
                title="Download QR code"
                aria-label="Download QR code"
              >
                <img
                  src={qrUrl}
                  alt={`${method.name} QR code`}
                  className="h-full w-full object-contain"
                />
              </a>
            ) : (
              <div className="flex h-full min-h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-background text-muted-foreground">
                <CreditCard className="size-4" />
                <span className="mt-1 text-[9px] font-medium">No QR</span>
              </div>
            )}

            <div className="grid min-h-[7.25rem] min-w-0 rounded-md border border-border/70 bg-background px-2">
              <CompactDetail label="Method" value={method.name} />
              <CompactDetail
                label="Type"
                value={TYPE_META[method.type]?.label || "Payment method"}
              />

              {method.accountName && (
                <CompactDetail
                  label="Account name"
                  value={method.accountName}
                />
              )}

              {method.accountNumber && (
                <CompactDetail
                  label="Account number"
                  value={method.accountNumber}
                  copyable
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompactDetail = ({ label, value, copyable = false }) => {
  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied.`);
    } catch (error) {
      console.error("COPY ERROR:", error);
      toast.error("Unable to copy. Please copy it manually.");
    }
  };

  return (
    <div className="flex min-h-0 items-center justify-between gap-3 border-b last:border-b-0">
      <span className="shrink-0 text-[10px] text-muted-foreground">
        {label}
      </span>

      <span className="flex min-w-0 items-center justify-end gap-1.5">
        {copyable && value && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-5 shrink-0 mr-1 items-center justify-center rounded border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={`Copy ${label.toLowerCase()}`}
          >
            <Copy className="size-3" />
          </button>
        )}
        <span className="break-all text-right text-xs font-semibold">
          {value || "-"}
        </span>
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                PAYMENT FORM                                */
/* -------------------------------------------------------------------------- */

const PaymentForm = ({
  amountPaid,
  setAmountPaid,
  payment,
  method,
  paidAmount,
  invalidAmount,
  belowDeposit,
  exceedsBalance,
  remainingAfterPayment,
}) => {
  return (
    <div>
      <SectionHeader
        title="Payment information"
        description="Enter the details of the payment you sent."
      />

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <FormField label="Amount sent">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ₱
            </span>

            <Input
              type="number"
              min="1"
              max={payment.balance || undefined}
              value={amountPaid}
              onChange={({ target }) => setAmountPaid(target.value)}
              className={`h-8 pl-6 text-xs font-semibold ${
                invalidAmount ? "border-destructive" : ""
              }`}
            />
          </div>
        </FormField>

        <FormField label="Reference number">
          <Input placeholder="Transaction reference" className="h-8 text-xs" />
        </FormField>
      </div>

      {belowDeposit && (
        <InlineWarning
          message={`Minimum down payment is ${Formatter.amount(
            payment.requiredDeposit,
          )}.`}
        />
      )}

      {exceedsBalance && (
        <InlineWarning
          message={`Amount cannot exceed your balance of ${Formatter.amount(
            payment.balance,
          )}.`}
        />
      )}

      <div className="mt-2.5">
        <FormField label="Proof of payment">
          <label className="flex h-14 cursor-pointer items-center gap-2.5 rounded-md border border-dashed bg-muted/10 px-3 transition hover:border-primary/30 hover:bg-muted/20">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
              <ImagePlus className="size-3.5 text-muted-foreground" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium">
                Upload receipt or screenshot
              </p>

              <p className="text-[9px] text-muted-foreground">
                JPG, PNG or WEBP
              </p>
            </div>

            <span className="ml-auto shrink-0 text-[10px] font-medium text-primary">
              Browse
            </span>

            <input type="file" accept="image/*" className="sr-only" />
          </label>
        </FormField>
      </div>

      <div className="mt-2.5">
        <FormField label="Notes (optional)">
          <Textarea
            placeholder="Add a note if needed"
            className="min-h-12 resize-none text-xs"
          />
        </FormField>
      </div>

      {/* Mobile submit */}
      <div className="mt-3 border-t pt-3 lg:hidden">
        <Button
          className="h-9 w-full gap-1.5 text-xs"
          disabled={!method || invalidAmount}
        >
          <CheckCircle2 className="size-3.5" />
          Submit payment · {Formatter.amount(paidAmount)}
        </Button>

        <p className="mt-1.5 text-center text-[9px] leading-4 text-muted-foreground">
          Your payment will be reviewed before your booking is updated.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              PAYMENT SUMMARY                               */
/* -------------------------------------------------------------------------- */

const PaymentSummary = ({
  payment,
  method,
  paidAmount,
  invalidAmount,
  remainingAfterPayment,
}) => {
  const hasValidPaymentAmount = paidAmount > 0 && !invalidAmount;
  const hasDepositDue = payment.requiredDeposit > 0;
  const primaryLabel = hasDepositDue
    ? "Minimum payment due"
    : "Current balance";
  const primaryAmount = hasDepositDue
    ? payment.requiredDeposit
    : payment.balance;

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="bg-background px-4 py-3">
        <SectionHeader
          title="Payment summary"
          description="Review the amount before submitting your payment."
        />
      </div>

      <div className="border-t bg-muted/5 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {primaryLabel}
            </p>

            <p className="mt-1.5 text-2xl font-semibold leading-none tracking-tight sm:text-[1.75rem]">
              {Formatter.amount(primaryAmount)}
            </p>
          </div>

          {hasDepositDue && payment.depositDeadline && (
            <span className="shrink-0 rounded-md bg-muted/40 px-2 py-1 text-[9px] font-medium text-muted-foreground">
              Due {formatDate(payment.depositDeadline)}
            </span>
          )}
        </div>
      </div>

      <div className="border-t px-4 py-3">
        <SummaryRow
          label="Booking total"
          value={Formatter.amount(payment.total)}
        />

        <SummaryRow
          label="Already paid"
          value={Formatter.amount(payment.received)}
        />

        {hasDepositDue && (
          <SummaryRow
            label="Current balance"
            value={Formatter.amount(payment.balance)}
          />
        )}
      </div>

      {hasValidPaymentAmount && (
        <div className="border-t bg-muted/5 px-4 py-3">
          <SummaryRow
            label="Paying now"
            value={Formatter.amount(paidAmount)}
            strong
          />

          <SummaryRow
            label="Balance after"
            value={Formatter.amount(remainingAfterPayment)}
          />
        </div>
      )}

      <div className="border-t px-4 py-3.5">
        {method ? (
          <div className="flex items-center gap-2.5">
            <MethodLogo method={method} className="size-9 p-1.5" />

            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Paying with</p>

              <p className="mt-0.5 truncate text-sm font-semibold">
                {method.name}
              </p>
            </div>

            <span className="ml-auto shrink-0 rounded-md border bg-muted/20 px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {TYPE_META[method.type]?.label || "Payment method"}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a payment method to continue.
          </p>
        )}
      </div>

      <div className="hidden border-t p-3 lg:block">
        <Button
          className="h-9 w-full gap-1.5 text-xs"
          disabled={!method || invalidAmount}
        >
          <CheckCircle2 className="size-3.5" />
          Submit payment
        </Button>

        <p className="mt-2 text-center text-[11px] leading-4 text-muted-foreground">
          Payment will be reviewed before your booking is updated.
        </p>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, strong = false }) => {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span
        className={`max-w-[60%] break-words text-right text-xs ${
          strong ? "font-semibold text-foreground" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                   SHARED                                   */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-xs font-semibold">{title}</h2>

      {description && (
        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

const MethodLogo = ({ method, className = "size-7" }) => {
  const Icon = TYPE_META[method?.type]?.icon || CreditCard;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background p-1 ${className}`}
    >
      {method?.methodImgId ? (
        <img
          src={Cloudinary.getPaymentMethodImg(
            method.methodImgId,
            method._id,
            "method",
          )}
          alt={`${method.name} logo`}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <Icon className="size-3.5 text-muted-foreground" />
      )}
    </span>
  );
};

const FormField = ({ label, children }) => {
  return (
    <div className="grid gap-1">
      <Label className="text-[10px] font-medium">{label}</Label>

      {children}
    </div>
  );
};

const InlineWarning = ({ message }) => {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1.5 text-[10px] leading-4 text-destructive">
      <AlertTriangle className="mt-0.5 size-3 shrink-0" />

      <span>{message}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  SKELETON                                  */
/* -------------------------------------------------------------------------- */

const PaymentSkeleton = () => {
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="overflow-hidden rounded-lg border">
        <div className="p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>

        <div className="border-t p-4">
          <Skeleton className="h-3 w-28" />

          <div className="mt-2 flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>

        <div className="border-t p-4">
          <Skeleton className="h-28 w-full" />
        </div>

        <div className="border-t p-4">
          <Skeleton className="h-44 w-full" />
        </div>
      </section>

      <aside>
        <div className="overflow-hidden rounded-lg border">
          <div className="p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-7 w-32" />
          </div>

          <div className="border-t p-4">
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="border-t p-4">
            <Skeleton className="h-28 w-full" />
          </div>

          <div className="border-t p-3">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </aside>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

const getPaymentSummary = (booking) => {
  const payments = Array.isArray(booking?.payments) ? booking.payments : [];

  const total = Number(booking?.pricing?.total || 0);

  const received = payments.reduce((sum, payment) => {
    if (["voided", "refunded"].includes(payment?.status)) {
      return sum;
    }

    return sum + Number(payment?.amount || 0);
  }, 0);

  const balance = Math.max(total - received, 0);

  const requiredDepositTotal = Number(
    booking?.terms?.requiredDeposit || balance || 0,
  );

  const requiredDeposit = Math.min(
    Math.max(requiredDepositTotal - received, 0),
    balance,
  );

  return {
    total,
    received,
    balance,
    requiredDeposit,
    depositDeadline: booking?.terms?.depositDeadline,
  };
};
