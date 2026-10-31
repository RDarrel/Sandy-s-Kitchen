import { useEffect, useId, useState } from "react";
import { Content as AlertDialogContent } from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  CreditCard,
  LockKeyhole,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Formatter } from "@/services/utilities";
import { getPaymentSummary } from "@/pages/platforms/customer/myBookings/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  CANCEL_BUSINESS_BOOKING,
  CANCEL_CUSTOMER_BOOKING,
} from "@/services/redux/slices/events/bookings";
import Spinner from "@/components/shared/spinner";
import { BROWSE } from "@/services/redux/slices/events/paymentMethods";

const CANCELLATION_REASONS = [
  "Scheduling conflict",
  "Venue unavailable",
  "Operational issue",
  "Unable to fulfill booking",
  "Other",
];

const INFORMATION_SOURCES = [
  { value: "phone", label: "Phone Call" },
  { value: "messenger", label: "Messenger" },
  { value: "in_person", label: "In Person" },
  { value: "other", label: "Other" },
];

const controlClass =
  "h-9 w-full rounded-md bg-background px-2.5 text-sm shadow-none";

const Field = ({ label, htmlFor, children }) => (
  <div className="space-y-1">
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
    </Label>
    {children}
  </div>
);

const Cancellation = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const id = useId();
  const { auth } = useSelector(({ auth }) => auth);
  const { collections: paymentMethods = [], isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);

  const { formSubmitted } = useSelector(({ bookings }) => bookings);

  const [quickReason, setQuickReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  const [includeAccount, setIncludeAccount] = useState(false);
  const [method, setMethod] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountSource, setAccountSource] = useState("");

  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const {
    verifiedAmount = 0,
    pendingAmount = 0,
    hasVerifiedPayments = false,
    hasPendingPayment = false,
  } = getPaymentSummary(booking);

  // Business-initiated cancellation:
  // Full refund of verified payments.
  // The backend must calculate the final refund.
  const totalPaid = Math.max(0, verifiedAmount);
  const nonRefundableAmount = 0;
  const refundAmount = totalPaid;
  const hasRefund = refundAmount > 0;

  const reason = quickReason === "Other" ? otherReason.trim() : quickReason;

  const refundMethods = paymentMethods.filter(
    ({ isActive, type }) =>
      isActive && (type === "e_wallet" || type === "bank_transfer"),
  );

  const selectedMethod = refundMethods.find(({ _id }) => _id === method);

  const isWallet = selectedMethod?.type === "e_wallet";

  const accountDetailsComplete =
    Boolean(selectedMethod) &&
    Boolean(accountName.trim()) &&
    Boolean(accountNumber.trim()) &&
    Boolean(accountSource);

  const canSubmit =
    Boolean(booking?._id) &&
    Boolean(reason) &&
    acknowledged &&
    !formSubmitted &&
    !hasPendingPayment &&
    (!hasRefund || !includeAccount || accountDetailsComplete);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (hasPendingPayment) return;

    if (!canSubmit) {
      toast.error("Please complete the required fields.");
      return;
    }

    const cancellation = {
      reason,
      initiatedBy: "business",
      cancelledBy: auth?._id,
      cancelledAt: new Date(),
      totalPaid,
      nonRefundableAmount,

      ...(hasRefund && {
        refund: {
          amount: refundAmount,
          status: "pending",
          ...(includeAccount && {
            method,
            accountName: accountName.trim(),
            accountNumber: accountNumber.trim(),
            accountProvidedBy: "staff",
            accountProvidedByUser: auth?._id,
            accountProvidedAt: new Date(),
            accountSource,
          }),
        },
      }),
    };

    try {
      await dispatch(
        CANCEL_BUSINESS_BOOKING({
          _id: booking._id,
          cancellation,
          statusTransaction: {
            old: booking?.status,
            new: "cancelled",
          },
          hasRefund,
          includeAccount,
          totalValueChange: booking?.pricing?.total,
          amountReceived: booking?.pricing?.total - verifiedAmount,
        }),
      ).unwrap();

      toast.success(
        hasRefund
          ? "Booking cancelled. Refund is pending."
          : "Booking cancelled successfully.",
      );

      onClose();
    } catch (error) {
      console.error("Cancellation failed:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Unable to cancel booking. Please try again.",
      );
    }
  };

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !formSubmitted) onClose();
      }}
    >
      <AlertDialogPortal>
        <AlertDialogOverlay className="overflow-y-auto overscroll-contain bg-black/50">
          <div className="flex min-h-full items-center justify-center p-4">
            <AlertDialogContent className="relative w-full max-w-[480px] shrink-0 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl outline-none">
              <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                {/* HEADER */}
                <div className="flex items-start justify-between gap-3">
                  <AlertDialogHeader className="min-w-0 gap-0.5 text-left">
                    <AlertDialogTitle className="text-lg font-semibold leading-6">
                      Cancel Booking?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="break-words text-sm leading-5 text-muted-foreground">
                      {booking?.eventType || "Event booking"}
                      {booking?.reference && ` · ${booking.reference}`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogCancel
                    type="button"
                    disabled={formSubmitted}
                    aria-label="Close cancellation dialog"
                    className="-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted"
                  >
                    <X className="size-4" />
                  </AlertDialogCancel>
                </div>

                {/* REFUND SUMMARY */}
                {hasPendingPayment && (
                  <div role="alert" className="mt-4 flex items-start gap-2">
                    <TriangleAlert
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold">
                        Cancellation Unavailable
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        This booking can&apos;t be cancelled while a payment is
                        being reviewed. Please approve or reject the pending
                        payment before cancelling.
                      </p>
                    </div>
                  </div>
                )}
                {(hasVerifiedPayments || hasPendingPayment) &&
                  !(hasPendingPayment && !hasRefund) && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                      <dl className="relative p-1">
                        <div
                          aria-hidden="true"
                          className="absolute bottom-5 left-[22px] top-5 w-px bg-border/80"
                        />

                        <div className="relative flex items-center justify-between gap-3 px-2 py-1">
                          <dt className="flex items-center gap-2 text-sm leading-5 text-foreground/80">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground ring-2 ring-background">
                              <CreditCard
                                aria-hidden="true"
                                className="size-3.5"
                              />
                            </span>
                            Verified Payments
                          </dt>

                          <dd className="text-right text-sm font-medium tabular-nums">
                            {Formatter.amount(totalPaid)}
                          </dd>
                        </div>

                        <div className="relative flex items-center justify-between gap-3 px-2 py-1">
                          <dt className="flex items-center gap-2 text-sm leading-5 text-foreground/80">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground ring-2 ring-background">
                              <LockKeyhole
                                aria-hidden="true"
                                className="size-3.5"
                              />
                            </span>
                            Non-refundable Amount
                          </dt>

                          <dd className="text-right text-sm font-medium tabular-nums">
                            {Formatter.amount(nonRefundableAmount)}
                          </dd>
                        </div>

                        <div className="relative mt-0.5 flex items-center justify-between gap-3 rounded bg-primary/[0.04] px-2 py-1.5">
                          <dt className="flex items-center gap-2 text-sm font-medium leading-5">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background text-primary">
                              <ArrowDownLeft
                                aria-hidden="true"
                                className="size-3.5"
                              />
                            </span>
                            Refund Amount
                          </dt>

                          <dd className="text-right text-base font-semibold text-primary tabular-nums">
                            {Formatter.amount(refundAmount)}
                          </dd>
                        </div>
                      </dl>

                      {pendingAmount > 0 && (
                        <p className="border-t border-border/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                          Pending payments ({Formatter.amount(pendingAmount)})
                          are excluded.
                        </p>
                      )}
                    </div>
                  )}

                {/* CANCELLATION REASON */}
                <div className="mt-3 space-y-2.5">
                  <Field label="Cancellation Reason *" htmlFor={`${id}-reason`}>
                    <Select
                      value={quickReason}
                      onValueChange={setQuickReason}
                      disabled={hasPendingPayment}
                    >
                      <SelectTrigger
                        id={`${id}-reason`}
                        className={controlClass}
                      >
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>

                      <SelectContent>
                        {CANCELLATION_REASONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {quickReason === "Other" && (
                    <Field
                      label="Specify Reason *"
                      htmlFor={`${id}-other-reason`}
                    >
                      <Textarea
                        id={`${id}-other-reason`}
                        value={otherReason}
                        disabled={hasPendingPayment}
                        onChange={(event) => setOtherReason(event.target.value)}
                        required
                        maxLength={1000}
                        placeholder="Enter cancellation reason"
                        className="min-h-16 resize-none rounded-md bg-background px-2.5 py-2 text-sm shadow-none"
                      />
                    </Field>
                  )}
                </div>

                {/* OPTIONAL REFUND ACCOUNT */}
                {hasRefund && (
                  <div className="mt-3 space-y-2.5 border-t border-border pt-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Refund Account Details
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (Optional)
                        </span>
                      </p>

                      <p className="text-xs leading-5 text-muted-foreground">
                        The customer can provide refund details later, or staff
                        can enter them now.
                      </p>
                    </div>

                    <div
                      className={`overflow-hidden rounded-lg border transition-colors ${
                        includeAccount
                          ? "border-primary/40 bg-primary/[0.03]"
                          : "border-border bg-muted/20"
                      }`}
                    >
                      <div className="relative grid min-h-10 grid-cols-[1rem_minmax(0,1fr)] items-center gap-x-2.5 px-3 py-2 transition-colors hover:bg-muted/40">
                        <Checkbox
                          id={`${id}-include-account`}
                          checked={includeAccount}
                          disabled={formSubmitted || hasPendingPayment}
                          onCheckedChange={(checked) =>
                            setIncludeAccount(checked === true)
                          }
                          aria-controls={
                            includeAccount ? `${id}-account-fields` : undefined
                          }
                          aria-describedby={`${id}-account-hint`}
                          className="col-start-1 row-start-1 size-4 rounded-sm"
                        />

                        <Label
                          htmlFor={`${id}-include-account`}
                          className="col-start-2 row-start-1 block cursor-pointer text-xs font-medium leading-5 after:absolute after:inset-0"
                        >
                          Enter account details now
                        </Label>
                        <p
                          id={`${id}-account-hint`}
                          className="col-start-2 row-start-2 truncate text-[11px] leading-4 text-muted-foreground"
                          title="Add the customer's refund account."
                        >
                          Add the customer's refund account.
                        </p>
                      </div>

                      {includeAccount && (
                        <div
                          id={`${id}-account-fields`}
                          className="space-y-3 border-t border-primary/15 bg-background p-3"
                        >
                          <Field
                            label="Refund Method *"
                            htmlFor={`${id}-method`}
                          >
                            <Select
                              value={method}
                              disabled={
                                hasPendingPayment ||
                                isLoadingMethods ||
                                refundMethods.length === 0
                              }
                              onValueChange={(value) => {
                                setMethod(value);
                                setAccountNumber("");
                              }}
                            >
                              <SelectTrigger
                                id={`${id}-method`}
                                className={controlClass}
                              >
                                <SelectValue
                                  placeholder={
                                    isLoadingMethods
                                      ? "Loading methods..."
                                      : "Select a method"
                                  }
                                />
                              </SelectTrigger>

                              <SelectContent>
                                {refundMethods.map((option) => (
                                  <SelectItem
                                    key={option._id}
                                    value={option._id}
                                  >
                                    {option.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          {!isLoadingMethods && refundMethods.length === 0 && (
                            <p
                              role="status"
                              className="text-xs leading-5 text-muted-foreground"
                            >
                              No refund methods available. You can add details
                              later.
                            </p>
                          )}

                          {selectedMethod && (
                            <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                              <Field
                                label="Account Name *"
                                htmlFor={`${id}-account-name`}
                              >
                                <Input
                                  id={`${id}-account-name`}
                                  value={accountName}
                                  disabled={hasPendingPayment}
                                  onChange={(event) =>
                                    setAccountName(event.target.value)
                                  }
                                  required
                                  maxLength={150}
                                  placeholder="Account holder's name"
                                  className={controlClass}
                                />
                              </Field>

                              <Field
                                label={
                                  isWallet
                                    ? `${selectedMethod.name} Number *`
                                    : "Account Number *"
                                }
                                htmlFor={`${id}-account-number`}
                              >
                                <Input
                                  id={`${id}-account-number`}
                                  value={accountNumber}
                                  disabled={hasPendingPayment}
                                  onChange={(event) =>
                                    setAccountNumber(event.target.value)
                                  }
                                  required
                                  inputMode="numeric"
                                  maxLength={isWallet ? 11 : 34}
                                  placeholder={
                                    isWallet ? "09XXXXXXXXX" : "Account number"
                                  }
                                  className={controlClass}
                                />
                              </Field>
                            </div>
                          )}

                          <Field
                            label="Details Received Via *"
                            htmlFor={`${id}-account-source`}
                          >
                            <Select
                              value={accountSource}
                              disabled={hasPendingPayment}
                              onValueChange={setAccountSource}
                            >
                              <SelectTrigger
                                id={`${id}-account-source`}
                                className={controlClass}
                              >
                                <SelectValue placeholder="Select a source" />
                              </SelectTrigger>

                              <SelectContent>
                                {INFORMATION_SOURCES.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>

                          <p className="text-xs leading-5 text-muted-foreground">
                            Check the account details before saving.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CONFIRMATION */}
                <div className="mt-3 flex items-start gap-2.5 border-t border-border pt-3">
                  <Checkbox
                    id={`${id}-acknowledgment`}
                    checked={acknowledged}
                    disabled={hasPendingPayment}
                    onCheckedChange={(checked) =>
                      setAcknowledged(checked === true)
                    }
                    required
                    className="mt-0.5 size-4 shrink-0 rounded shadow-none"
                  />

                  <Label
                    htmlFor={`${id}-acknowledgment`}
                    className="block cursor-pointer text-sm font-normal leading-5 text-muted-foreground"
                  >
                    I understand that this booking cannot be restored.
                    {hasRefund && " The refund will be processed separately."}
                  </Label>
                </div>

                {/* ACTIONS */}
                <AlertDialogFooter className="mt-3 flex-row flex-wrap justify-end gap-2 sm:space-x-0">
                  <AlertDialogCancel
                    type="button"
                    disabled={formSubmitted}
                    className="mt-0 h-9 rounded-md bg-background px-3 text-sm shadow-none"
                  >
                    {hasPendingPayment ? "Close" : "Keep Booking"}
                  </AlertDialogCancel>

                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!canSubmit}
                    className="h-9 rounded-md px-3 text-sm font-medium shadow-none"
                  >
                    Cancel Booking
                    <Spinner formSubmitted={formSubmitted} />
                  </Button>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </div>
        </AlertDialogOverlay>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

const CancelConfirmation = ({ isOpen, setIsOpen, selected }) =>
  isOpen ? (
    <Cancellation booking={selected} onClose={() => setIsOpen(false)} />
  ) : null;

export default CancelConfirmation;
