import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter, fullName } from "@/services/utilities";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  FileImage,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

const QUICK_REASONS = [
  "Proof is unreadable",
  "Amount doesn't match the receipt",
  "Invalid reference number",
];

const TORN_EDGE =
  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%";

const ReviewPayment = ({
  isOpen,
  setIsOpen,
  selected: booking = {},
  onVerify,
  onReject,
}) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [proofError, setProofError] = useState(false);

  const copyTimer = useRef(null);
  const actionLock = useRef(false);

  const payment = booking?.payments?.find(({ status }) => status === "pending");

  const customerName = fullName(booking?.customer?.fullName);
  const totalAmount = toAmount(booking?.pricing?.total);
  const requiredDownPayment = toAmount(booking?.terms?.requiredDeposit);
  const paymentAmount = toAmount(payment?.amount);
  const verifiedAmount = getVerifiedAmount(booking);

  const currentBalance = Math.max(totalAmount - verifiedAmount, 0);
  const balanceAfterVerification = Math.max(currentBalance - paymentAmount, 0);

  const downPaymentShort = Math.max(
    requiredDownPayment - verifiedAmount - paymentAmount,
    0,
  );

  const willConfirm =
    booking?.status === "approved" &&
    requiredDownPayment > 0 &&
    downPaymentShort === 0;

  const amountDue =
    payment?.type === "deposit" && requiredDownPayment > 0
      ? Math.max(requiredDownPayment - verifiedAmount, 0)
      : payment?.type === "final"
        ? currentBalance
        : null;

  const amountDiff =
    amountDue === null
      ? 0
      : Math.round((paymentAmount - amountDue) * 100) / 100;

  const methodId = getPaymentMethodId(payment);
  const proofSrc =
    payment?.proof?.url ||
    (payment?.proofImgId && methodId
      ? Cloudinary.getPaymentProofImgId(
          payment.proofImgId,
          payment._id,
          methodId,
        )
      : "");

  useEffect(() => {
    setIsRejecting(false);
    setReason("");
    setError("");
    setCopied(false);
    setProofError(false);
    clearTimeout(copyTimer.current);
  }, [isOpen, booking?._id, payment?._id, proofSrc]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const resetForm = () => {
    setIsRejecting(false);
    setReason("");
    setError("");
    setCopied(false);
    clearTimeout(copyTimer.current);
  };

  const handleOpenChange = (open) => {
    if (actionLock.current) return;

    resetForm();
    setIsOpen(open);
  };

  const handleCopy = async () => {
    if (!payment?.reference) return;

    try {
      await navigator.clipboard.writeText(String(payment.reference));

      clearTimeout(copyTimer.current);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy the reference number.");
    }
  };

  const handleVerify = async () => {
    if (!payment || !onVerify || actionLock.current) return;

    actionLock.current = true;
    setBusy("verify");
    setError("");

    try {
      await onVerify(payment);
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to verify payment."));
    } finally {
      actionLock.current = false;
      setBusy("");
    }
  };

  const handleReject = async () => {
    if (!payment || !onReject || actionLock.current) return;

    if (!reason.trim()) {
      setError("Please enter a reason for rejection.");
      return;
    }

    actionLock.current = true;
    setBusy("reject");
    setError("");

    try {
      await onReject(payment, reason.trim());
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to reject payment."));
    } finally {
      actionLock.current = false;
      setBusy("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex  w-[calc(100%-1.5rem)] flex-col gap-0  p-0 sm:max-w-[880px]"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        {/* Original compact header */}
        <DialogHeader className="shrink-0 space-y-0 border-b px-5 py-3.5 pr-12 text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <DialogTitle className="text-base leading-tight">
                Verify payment
              </DialogTitle>

              <DialogDescription className="mt-0.5 break-words text-xs">
                <span className="font-medium text-foreground">
                  {booking?.reference || "Booking"}
                </span>
                {booking?.eventType && ` · ${booking.eventType}`}
                {customerName && ` · ${customerName}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {payment ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-4">
              {/* Both columns stretch to the same row height. */}
              <div className="grid items-stretch gap-4 md:grid-cols-2">
                {/* Customer proof */}
                <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
                    <h3 className="text-sm font-medium">Customer proof</h3>

                    {proofSrc && (
                      <a
                        href={proofSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Open
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {/*
                    The desktop image is positioned inside the available
                    space so its original dimensions cannot stretch the row.
                  */}
                  <div className="relative h-72 md:h-auto md:min-h-80 md:flex-1">
                    <div className="absolute inset-3">
                      {proofSrc && !proofError ? (
                        <a
                          href={proofSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open payment proof"
                          className="flex h-full w-full items-center justify-center"
                        >
                          <img
                            src={proofSrc}
                            alt="Customer payment proof"
                            onError={() => setProofError(true)}
                            className="h-full w-full object-contain"
                          />
                        </a>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 text-center">
                          <FileImage className="size-6 text-muted-foreground" />

                          <p className="text-sm text-muted-foreground">
                            {proofError
                              ? "Unable to load proof"
                              : "No proof uploaded"}
                          </p>

                          {proofError && (
                            <p className="text-xs text-muted-foreground">
                              Use Open to view the original image.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Original payment slip */}
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
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  </div>

                  <div className="py-4 text-center">
                    <p className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
                      {Formatter.amount(paymentAmount)}
                    </p>

                    <div
                      className={`mt-2 flex items-center justify-center gap-1 text-xs font-medium ${
                        amountDiff === 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      <Clock className="size-3.5 shrink-0" />

                      <span>Awaiting payment verification</span>
                    </div>
                  </div>

                  <SlipRows>
                    <Row label="Method">
                      <p className="font-semibold">
                        {getPaymentMethodName(payment)}
                      </p>
                    </Row>

                    <Row label="Type">{formatPaymentType(payment?.type)}</Row>

                    <Row label="Transaction Reference">
                      <span className="flex min-w-0 items-start justify-end gap-1">
                        <span className="select-all break-all font-mono font-semibold">
                          {payment?.reference || "—"}
                        </span>
                      </span>
                    </Row>

                    <Row label="Submitted">
                      {formatDateTime(payment?.createdAt)}
                    </Row>

                    {payment?.notes && <Row label="Notes">{payment.notes}</Row>}
                  </SlipRows>

                  <SlipRows>
                    <Row label="Booking total">
                      {Formatter.amount(totalAmount)}
                    </Row>

                    <Row label="Verified so far">
                      {Formatter.amount(verifiedAmount)}
                    </Row>

                    <Row label="This payment">
                      {Formatter.amount(paymentAmount)}
                    </Row>

                    <Row label="Balance after verification" strong>
                      {Formatter.amount(balanceAfterVerification)}
                    </Row>
                  </SlipRows>

                  {booking?.status === "approved" &&
                    requiredDownPayment > 0 && (
                      <p
                        className={`mt-auto border-t border-dashed pt-3 text-center text-xs ${
                          willConfirm
                            ? "font-medium text-emerald-700 dark:text-emerald-400"
                            : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        Once verified, this payment will be applied to the
                        booking balance.
                      </p>
                    )}
                </section>
              </div>

              {/* Separate from the equal-height columns */}
              {isRejecting && (
                <section className="mt-4 rounded-lg border bg-background p-3 shadow-sm">
                  <label
                    htmlFor="payment-rejection-reason"
                    className="text-sm font-medium"
                  >
                    Reason for rejection
                  </label>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {QUICK_REASONS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={Boolean(busy)}
                        aria-pressed={reason === item}
                        onClick={() => {
                          setReason(item);
                          setError("");
                        }}
                        className={`rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-50 ${
                          reason === item ? "border-foreground bg-muted" : ""
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="payment-rejection-reason"
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setError("");
                    }}
                    disabled={Boolean(busy)}
                    rows={2}
                    placeholder="The customer will see this."
                    className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  />
                </section>
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t px-5 py-3">
              <Button
                type="button"
                variant="ghost"
                disabled={Boolean(busy)}
                onClick={() =>
                  isRejecting ? resetForm() : handleOpenChange(false)
                }
                className="sm:mr-auto"
              >
                {isRejecting ? "Back" : "Close"}
              </Button>

              {isRejecting ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={Boolean(busy) || !onReject || !reason.trim()}
                  onClick={handleReject}
                >
                  {busy === "reject" && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Reject
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={Boolean(busy) || !onReject}
                    onClick={() => {
                      setIsRejecting(true);
                      setError("");
                    }}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    Reject
                  </Button>

                  <Button
                    type="button"
                    disabled={Boolean(busy) || !onVerify}
                    onClick={handleVerify}
                  >
                    {busy === "verify" && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    Verify
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
              <ReceiptText className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No pending payment</p>
            </div>

            <DialogFooter className="border-t px-5 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewPayment;

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

const toAmount = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getPaymentMethodId = (payment) =>
  typeof payment?.method === "object"
    ? payment?.method?._id || ""
    : payment?.method || "";

const getPaymentMethodName = (payment) =>
  typeof payment?.method === "object"
    ? payment?.method?.name || "Payment method"
    : formatPaymentType(payment?.method || "Payment method");

const getVerifiedAmount = (booking) =>
  (booking?.payments || []).reduce(
    (total, item) =>
      item?.status === "verified" ? total + toAmount(item.amount) : total,
    0,
  );

const formatPaymentType = (value = "") => {
  const labels = {
    deposit: "Down payment",
    partial: "Partial payment",
    final: "Final payment",
    gcash: "GCash",
    maya: "Maya",
    bank_transfer: "Bank transfer",
    e_wallet: "E-wallet",
    cash: "Cash",
  };

  return (
    labels[value] ||
    String(value || "Payment")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}, ${Formatter.time(date)}`;
};

const getErrorMessage = (error, fallback) =>
  typeof error === "string" ? error : error?.message || fallback;
