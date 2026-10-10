import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/shared/spinner";
import { BROWSE } from "@/services/redux/slices/events/paymentMethods";
import { Formatter, fullName } from "@/services/utilities";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentSummary, getPaymentType, sortPaymentMethods } from "./utils";
import { UPDATE } from "@/services/redux/slices/events/payments";
import {
  CONFIRM_BOOKING,
  UPDATE_PAYMENT,
} from "@/services/redux/slices/events/bookings";
import { toast } from "sonner";

const RecordPayment = ({ isOpen, setIsOpen, selected = {} }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ payments }) => payments);
  const { collections: methods = [], isLoading: isLoadingMethods } =
    useSelector(({ paymentMethods }) => paymentMethods);

  const dispatch = useDispatch();

  const payment = useMemo(() => getPaymentSummary(selected), [selected]);

  const activeMethods = useMemo(() => sortPaymentMethods(methods), [methods]);

  const needsDownPayment = payment.requiredDeposit > 0;

  const suggestedAmount = needsDownPayment
    ? payment.requiredDeposit
    : payment.balance;

  const [form, setForm] = useState({
    method: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    dispatch(BROWSE());
    setForm({
      method: "",
      amount: suggestedAmount > 0 ? String(suggestedAmount) : "",
      notes: "",
    });
  }, [dispatch, isOpen, selected?._id, suggestedAmount]);

  const paidAmount = Number(form.amount || 0);

  const remainingAfterPayment = Math.max(
    payment.balance - (Number.isFinite(paidAmount) ? paidAmount : 0),
    0,
  );

  const hasValidPreview =
    Number.isFinite(paidAmount) &&
    paidAmount > 0 &&
    paidAmount <= payment.balance;

  const willBeFullyPaid = hasValidPreview && remainingAfterPayment === 0;

  const handleReset = () => {
    setForm({
      method: "",
      amount: suggestedAmount > 0 ? String(suggestedAmount) : "",
      notes: "",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const willConfirmBooking = selected?.status === "approved";

    const data = {
      ...form,
      status: "verified",
      booking: selected?._id,
      bookingId: selected?._id,
      origin: "walk_in",
      reviewedBy: auth?._id,
      reviewedAt: new Date(),
      willConfirmBooking,
      type: getPaymentType(selected, form?.amount, payment?.balance),
      snapshot: {
        bookingTotal: payment?.total,
        verifiedSoFar: payment?.received,
      },
    };

    dispatch(UPDATE(data))
      .unwrap()
      .then(({ data }) => {
        if (willConfirmBooking) {
          dispatch(
            CONFIRM_BOOKING({
              data,
              bookingStatus: selected?.status,
              amountReceived: data?.amount,
            }),
          );
          toast.success("Payment recorded and booking confirmed successfully.");
        } else {
          dispatch(
            UPDATE_PAYMENT({
              data,
              bookingStatus: selected?.status,
              amountReceived: data?.amount,
            }),
          );
          toast.success("Payment recorded successfully.");
        }
        setIsOpen(false);
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to record payment. Please try again.");
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0",
          "sm:max-w-[480px]",
        )}
      >
        {/* HEADER */}

        <DialogHeader className="shrink-0 border-b px-5 py-3.5 text-left">
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4 shrink-0 text-muted-foreground" />

            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold">
                Record Payment
              </DialogTitle>

              <DialogDescription className="mt-0.5 flex min-w-0 items-center gap-2 text-xs">
                <span className="shrink-0">
                  {selected?.reference || "Booking"}
                </span>

                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 rounded-full bg-foreground/45"
                />

                <span className="min-w-0 truncate">
                  {fullName(selected?.customer?.fullName)}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
            {/* PAYMENT OVERVIEW */}

            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {needsDownPayment
                  ? "Required down payment"
                  : "Remaining balance"}
              </p>

              <p className="mt-1 text-2xl font-semibold leading-tight tracking-tight tabular-nums">
                {Formatter.amount(
                  needsDownPayment ? payment.requiredDeposit : payment.balance,
                )}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {payment.received > 0 && (
                  <>
                    <span>{Formatter.amount(payment.received)} paid</span>

                    <span
                      aria-hidden="true"
                      className="size-1 shrink-0 rounded-full bg-foreground/45"
                    />
                  </>
                )}

                <span>{Formatter.amount(payment.total)} booking total</span>
              </div>
            </div>

            {/* PAYMENT METHOD & AMOUNT */}

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* PAYMENT METHOD */}

                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="record-payment-method"
                    className="text-xs font-medium"
                  >
                    Payment method
                  </Label>

                  <Select
                    value={form.method}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        method: value,
                      }))
                    }
                    required
                    disabled={isLoadingMethods || activeMethods.length === 0}
                  >
                    <SelectTrigger
                      id="record-payment-method"
                      className="h-9 w-full text-xs"
                    >
                      <SelectValue
                        placeholder={
                          isLoadingMethods
                            ? "Loading methods..."
                            : activeMethods.length === 0
                              ? "No methods available"
                              : "Select payment method"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {activeMethods.map((method) => (
                        <SelectItem
                          key={method._id}
                          value={method._id}
                          className="text-xs"
                        >
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <Label
                    htmlFor="record-payment-amount"
                    className="text-xs font-medium"
                  >
                    Amount received (₱)
                  </Label>

                  <Input
                    id="record-payment-amount"
                    type="number"
                    required
                    min={needsDownPayment ? payment.requiredDeposit : 1}
                    step="0.01"
                    max={payment.balance || undefined}
                    value={form.amount}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className={cn("h-9 text-sm tabular-nums")}
                  />
                </div>
              </div>

              <div className="flex justify-end -mt-2 -mb-2">
                <p
                  className={cn(
                    "text-[11px] font-medium tabular-nums",
                    willBeFullyPaid
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                >
                  Balance after:{" "}
                  {hasValidPreview
                    ? Formatter.amount(remainingAfterPayment)
                    : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="record-payment-notes" className="text-xs">
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>

              <Textarea
                id="record-payment-notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Add payment notes..."
                className="min-h-[64px] resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t px-5 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={formSubmitted}
            >
              Reset
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={formSubmitted || isLoadingMethods}
            >
              Record Payment
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPayment;
