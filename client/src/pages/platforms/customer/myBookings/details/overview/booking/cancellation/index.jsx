import { useId, useState } from "react";
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
import { getPaymentSummary } from "../../../../utils";
import { useDispatch, useSelector } from "react-redux";
import { CANCEL_CUSTOMER_BOOKING } from "@/services/redux/slices/events/bookings";
import Spinner from "@/components/shared/spinner";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Schedule conflict",
  "Event postponed",
  "Budget constraints",
  "Personal reasons",
  "Other",
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
  const { auth } = useSelector(({ auth }) => auth);
  const { collections: paymentMethods = [], isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const dispatch = useDispatch();
  const id = useId();
  const [quickReason, setQuickReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [method, setMethod] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [acknowledged, setAcknowledged] = useState(false);

  const {
    verifiedAmount = 0,
    downPayment = 0,
    pendingAmount = 0,
    hasVerifiedPayments = false,
    hasPendingPayment = false,
  } = getPaymentSummary(booking);

  // Preview only. The backend must calculate the final refund.
  const refundAmount = Math.max(0, verifiedAmount - downPayment);
  const hasRefund = hasVerifiedPayments && refundAmount > 0;

  const reason = quickReason === "Other" ? otherReason.trim() : quickReason;
  const refundMethods = paymentMethods.filter(
    ({ isActive, type }) =>
      isActive && (type === "e_wallet" || type === "bank_transfer"),
  );
  const selectedMethod = refundMethods.find(({ _id }) => _id === method);
  const isWallet = selectedMethod?.type === "e_wallet";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasPendingPayment) return;

    dispatch(
      CANCEL_CUSTOMER_BOOKING({
        _id: booking?._id,
        cancellation: {
          initiatedBy: "customer",
          cancelledBy: auth?._id,
          reason: quickReason === "other" ? reason : quickReason,
          totalPaid: verifiedAmount,
          nonRefundableAmount: downPayment,
          cancelledAt: new Date(),
          ...(hasRefund && {
            refund: {
              amount: refundAmount,
              accountProvidedBy: "customer",
              accountProvidedByUser: auth?._id,
              accountProvidedAt: new Date(),
              accountSource: "system",
              status: "pending",
              method,
              accountName,
              accountNumber,
            },
          }),
        },
      }),
    )
      .unwrap()
      .then(() => {
        onClose();
        toast.success("Booking cancelled successfully.");
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to cancel booking. Please try again.");
      });
  };

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
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
                      Cancel this booking?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="break-words text-sm leading-5 text-muted-foreground">
                      {booking.eventType || "Event booking"}
                      {booking.reference && ` · ${booking.reference}`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogCancel
                    type="button"
                    aria-label="Close cancellation dialog"
                    className="-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted"
                  >
                    <X className="size-4" />
                  </AlertDialogCancel>
                </div>

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
                        You can&apos;t cancel this booking while your payment is
                        being reviewed. Please wait until it&apos;s approved or
                        rejected before cancelling.
                      </p>
                    </div>
                  </div>
                )}

                {/* REFUND BREAKDOWN: Paid − Deposit = Refund */}
                {hasVerifiedPayments && (
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
                          Total paid
                        </dt>
                        <dd className="min-w-0 break-words text-right text-sm font-medium leading-5 tabular-nums">
                          {Formatter.amount(verifiedAmount)}
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
                          Non-refundable deposit
                        </dt>
                        <dd className="min-w-0 break-words text-right text-sm font-medium leading-5 tabular-nums">
                          −{Formatter.amount(downPayment)}
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
                        <dd className="min-w-0 break-words text-right text-base font-semibold leading-5 text-primary tabular-nums">
                          {Formatter.amount(refundAmount)}
                        </dd>
                      </div>
                    </dl>

                    {pendingAmount > 0 && (
                      <p className="border-t border-border/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        {pendingAmount > 0 &&
                          `Pending payments (${Formatter.amount(pendingAmount)}) are not included.`}
                      </p>
                    )}
                  </div>
                )}

                {/* REASON */}
                <div className="mt-3 space-y-2.5">
                  <Field
                    label="Reason for cancellation"
                    htmlFor={`${id}-reason-select`}
                  >
                    <Select
                      value={quickReason}
                      onValueChange={setQuickReason}
                      disabled={hasPendingPayment}
                      required
                    >
                      <SelectTrigger
                        id={`${id}-reason-select`}
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
                      label="Please specify"
                      htmlFor={`${id}-other-reason`}
                    >
                      <Textarea
                        id={`${id}-other-reason`}
                        value={otherReason}
                        disabled={hasPendingPayment}
                        onChange={(event) => setOtherReason(event.target.value)}
                        required
                        maxLength={1000}
                        placeholder="Briefly explain your reason"
                        className="min-h-16 resize-none rounded-md bg-background px-2.5 py-2 text-sm shadow-none"
                      />
                    </Field>
                  )}
                </div>

                {/* REFUND DESTINATION */}
                {hasRefund && (
                  <fieldset
                    disabled={hasPendingPayment}
                    className="mt-3 space-y-2.5 border-0 border-t border-solid border-border pt-3"
                  >
                    <legend className="sr-only">Refund destination</legend>

                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">
                        Where should we send your refund?
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {Formatter.amount(refundAmount)}
                        </span>{" "}
                        will be sent to the account you provide below.
                      </p>
                    </div>

                    <Field label="Send refund via" htmlFor={`${id}-method`}>
                      <Select
                        value={selectedMethod?._id || ""}
                        disabled={
                          hasPendingPayment ||
                          isLoadingMethods ||
                          refundMethods.length === 0
                        }
                        onValueChange={(value) => {
                          setMethod(value);
                          setAccountNumber("");
                        }}
                        required
                      >
                        <SelectTrigger
                          id={`${id}-method`}
                          className={controlClass}
                        >
                          <SelectValue
                            placeholder={
                              isLoadingMethods
                                ? "Loading payment methods..."
                                : "Select a refund method"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {refundMethods.map((option) => (
                            <SelectItem key={option._id} value={option._id}>
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
                        No active wallet or bank refund methods are available.
                      </p>
                    )}

                    {selectedMethod && (
                      <>
                        <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                          <Field
                            label="Account holder name"
                            htmlFor={`${id}-account-name`}
                          >
                            <Input
                              id={`${id}-account-name`}
                              value={accountName}
                              onChange={(event) =>
                                setAccountName(event.target.value)
                              }
                              required
                              maxLength={150}
                              placeholder="Name on the account"
                              className={controlClass}
                            />
                          </Field>

                          <Field
                            label={
                              isWallet
                                ? `${selectedMethod.name} number`
                                : "Account number"
                            }
                            htmlFor={`${id}-account-number`}
                          >
                            <Input
                              id={`${id}-account-number`}
                              value={accountNumber}
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

                        <p className="text-xs leading-5 text-muted-foreground">
                          Please ensure your account details are correct to
                          avoid delays or issues with your refund.
                        </p>
                      </>
                    )}
                  </fieldset>
                )}

                {/* ACKNOWLEDGMENT */}
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
                    {hasVerifiedPayments
                      ? `I understand that my ${Formatter.amount(downPayment)} payment will not be refunded and this cancellation cannot be undone.`
                      : "I understand that this booking cannot be restored once cancelled."}
                  </Label>
                </div>

                {/* FOOTER */}
                <AlertDialogFooter className="mt-3 flex-row flex-wrap justify-end gap-2 sm:space-x-0">
                  <AlertDialogCancel
                    type="button"
                    className="mt-0 h-9 rounded-md bg-background px-3 text-sm shadow-none"
                  >
                    {hasPendingPayment ? "Close" : "Keep booking"}
                  </AlertDialogCancel>

                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={formSubmitted || hasPendingPayment}
                    className="h-9 rounded-md px-3 text-sm font-medium shadow-none"
                  >
                    Confirm Cancellation{" "}
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

export default Cancellation;
