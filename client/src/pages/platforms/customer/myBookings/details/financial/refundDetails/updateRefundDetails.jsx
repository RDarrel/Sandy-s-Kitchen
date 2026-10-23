import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Content } from "@radix-ui/react-alert-dialog";
import {
  ArrowDownLeft,
  CreditCard,
  LockKeyhole,
  TriangleAlert,
  X,
} from "lucide-react";
import { Formatter } from "@/services/utilities";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/shared/spinner";
import { CANCEL_CUSTOMER_BOOKING } from "@/services/redux/slices/events/bookings";

const controlClass =
  "h-9 w-full rounded-md bg-background px-2.5 text-sm shadow-none";

const UpdateRefundDetails = ({ booking, onClose }) => {
  const id = useId();
  const { collections: paymentMethods = [], isLoading } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const { auth } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const refund = booking?.cancellation?.refund ?? {};
  const isProvidingAccount = !refund.accountProvidedBy;
  const totalPaid = Number(booking?.cancellation?.totalPaid ?? 0);
  const retainedAmount = Math.min(
    totalPaid,
    Number(booking?.cancellation?.nonRefundableAmount ?? 0),
  );
  const [method, setMethod] = useState(
    refund.method?._id ?? refund.method ?? "",
  );
  const [accountName, setAccountName] = useState(refund.accountName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    refund.accountNumber ?? "",
  );
  const methods = paymentMethods.filter(
    ({ isActive, type }) =>
      isActive && ["e_wallet", "bank_transfer"].includes(type),
  );
  const selectedMethod = methods.find(({ _id }) => _id === method);
  const isWallet = selectedMethod?.type === "e_wallet";

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(
      CANCEL_CUSTOMER_BOOKING({
        _id: booking?._id,
        cancellation: {
          ...booking?.cancellation,
          refund: {
            ...booking?.cancellation?.refund,
            method,
            accountName,
            accountNumber,
            ...(isProvidingAccount && {
              accountProvidedBy: "customer",
              accountProvidedByUser: auth?._id,
              accountProvidedAt: new Date(),
              accountSource: "system",
            }),
            ...(!isProvidingAccount && {
              accountCorrection: {
                ...booking?.cancellation?.refund?.accountCorrection,
                required: false,
                resolvedAt: new Date(),
              },
            }),
          },
        },
      }),
    )
      .unwrap()
      .then(() => {
        onClose();
        toast.success("Refund details updated successfully.");
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("Failed to update refund details. Please try again.");
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
            <Content className="relative w-full max-w-[480px] shrink-0 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl outline-none">
              <form className="p-4 sm:p-5" onSubmit={handleSubmit}>
                <div className="flex items-start justify-between gap-3">
                  <AlertDialogHeader className="min-w-0 gap-0.5 text-left">
                    <AlertDialogTitle className="text-lg font-semibold leading-6">
                      {isProvidingAccount
                        ? "Provide Refund Details"
                        : "Update Refund Details"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="break-words text-sm leading-5 text-muted-foreground">
                      {booking?.eventType || "Event booking"}
                      {booking?.reference && ` · ${booking.reference}`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogCancel
                    type="button"
                    aria-label="Close update refund details"
                    className="-mr-1.5 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground shadow-none hover:bg-muted"
                  >
                    <X className="size-4" />
                  </AlertDialogCancel>
                </div>

                {refund.accountCorrection?.reason && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border bg-muted/10 p-3">
                    <TriangleAlert
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">
                        Reason for correction
                      </p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-5 text-muted-foreground">
                        {refund.accountCorrection.reason}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 overflow-hidden rounded-lg border border-border bg-background">
                  <dl className="relative p-1">
                    <div
                      aria-hidden="true"
                      className="absolute bottom-5 left-[22px] top-5 w-px bg-border/80"
                    />
                    <BreakdownRow
                      label="Total paid"
                      value={Formatter.amount(totalPaid)}
                      icon={<CreditCard className="size-3.5" />}
                    />
                    <BreakdownRow
                      label="Non-refundable deposit"
                      value={`−${Formatter.amount(retainedAmount)}`}
                      icon={<LockKeyhole className="size-3.5" />}
                    />
                    <BreakdownRow
                      label="Your refund"
                      value={Formatter.amount(refund.amount ?? 0)}
                      icon={<ArrowDownLeft className="size-3.5" />}
                      highlighted
                    />
                  </dl>
                </div>

                <div className="mt-3 space-y-3">
                  <Field label="Send refund via" htmlFor={`${id}-method`}>
                    <Select
                      value={selectedMethod?._id || ""}
                      required
                      disabled={isLoading || !methods.length}
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
                            isLoading
                              ? "Loading payment methods..."
                              : "Select a refund method"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map((option) => (
                          <SelectItem key={option._id} value={option._id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  {!isLoading && !methods.length && (
                    <p
                      role="status"
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      No active wallet or bank refund methods are available.
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                    <Field label="Account holder name" htmlFor={`${id}-name`}>
                      <Input
                        id={`${id}-name`}
                        value={accountName}
                        onChange={(event) => setAccountName(event.target.value)}
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
                      htmlFor={`${id}-number`}
                    >
                      <Input
                        id={`${id}-number`}
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
                </div>

                <AlertDialogFooter className="mt-4 flex-row flex-wrap justify-end gap-2 sm:space-x-0">
                  <AlertDialogCancel
                    type="button"
                    className="mt-0 h-9 rounded-md bg-background px-3 text-sm shadow-none"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    type="submit"
                    disabled={formSubmitted}
                    className="h-9 rounded-md px-3 text-sm font-medium shadow-none"
                  >
                    Save Changes <Spinner formSubmitted={formSubmitted} />
                  </Button>
                </AlertDialogFooter>
              </form>
            </Content>
          </div>
        </AlertDialogOverlay>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

const Field = ({ label, htmlFor, children }) => (
  <div className="space-y-1">
    <Label htmlFor={htmlFor} className="text-sm font-medium">
      {label}
    </Label>
    {children}
  </div>
);

const BreakdownRow = ({ label, value, icon, highlighted = false }) => (
  <div
    className={`relative flex items-center justify-between gap-3 px-2 py-1 ${highlighted ? "mt-0.5 rounded bg-primary/[0.04] py-1.5" : ""}`}
  >
    <dt
      className={`flex items-center gap-2 text-sm leading-5 ${highlighted ? "font-medium" : "text-foreground/80"}`}
    >
      <span
        aria-hidden="true"
        className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-background ${highlighted ? "text-primary" : "text-muted-foreground"}`}
      >
        {icon}
      </span>
      {label}
    </dt>
    <dd
      className={`min-w-0 break-words text-right leading-5 tabular-nums ${highlighted ? "text-base font-semibold text-primary" : "text-sm font-medium"}`}
    >
      {value}
    </dd>
  </div>
);

export default UpdateRefundDetails;
