import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Formatter, fullName } from "@/services/utilities";
import {
  CircleCheck,
  TriangleAlert,
  Users,
  Building2,
  Utensils,
  CreditCard,
  Wallet,
  Receipt,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE } from "@/services/redux/slices/events/bookings";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";

const CompletedConfirmation = ({ isOpen, setIsOpen, selected: booking }) => {
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const { auth } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const paymentSummary = useMemo(() => {
    const toAmount = (value) => {
      const amount = Number(value);
      return Number.isFinite(amount) ? amount : 0;
    };

    const totalAmount = toAmount(booking?.pricing?.total);

    const paidAmount = (booking?.payments || []).reduce(
      (total, payment) =>
        payment?.status?.toLowerCase() === "verified"
          ? total + toAmount(payment.amount)
          : total,
      0,
    );

    return {
      totalAmount,
      paidAmount,
      outstandingBalance: Math.max(totalAmount - paidAmount, 0),
    };
  }, [booking?.payments, booking?.pricing?.total]);

  const { totalAmount, paidAmount, outstandingBalance } = paymentSummary;

  const bookingServices = [
    { type: "venue", label: "Venue" },
    { type: "catering", label: "Catering" },
  ].filter(
    ({ type }) =>
      booking?.bookingType === "both" || booking?.bookingType === type,
  );

  const handleCompleted = () => {
    dispatch(
      UPDATE({
        _id: booking?._id,
        status: "completed",
        userId: auth?._id,
        statusTransaction: { old: "setup", new: "completed" },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Booking marked as completed successfully.");
        setIsOpen(false);
      })
      .catch(() =>
        toast.error("Failed to complete the booking. Please try again."),
      );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-lg border-[#ead7c3] bg-[#fffaf4] p-0 shadow-xl sm:max-w-[420px] dark:border-border dark:bg-background">
        {/* Header */}
        <AlertDialogHeader className="gap-1.5 px-4 pb-3 pt-4 text-left">
          <AlertDialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CircleCheck className="size-4 shrink-0 text-emerald-600" />
            Mark Booking as Completed?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs leading-4">
            Are you sure you want to mark this booking as completed?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 px-4 pb-3">
          {/* Booking Details Card */}
          <div className="rounded-md border border-[#ead5bc] bg-[#fff8f0] p-3 dark:border-border dark:bg-muted/20">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold text-foreground">
                  {booking?.eventType || "Untitled Event"}
                </h3>

                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {fullName(booking?.customer?.fullName) || "—"}
                </p>
              </div>

              <span className="rounded border border-[#e9c9a4] bg-[#fbf0e3] px-1.5 py-0.5 text-[10px] font-medium text-[#805c3f] dark:border-border dark:bg-muted dark:text-foreground">
                {booking?.reference || "—"}
              </span>
            </div>

            {/* Service schedules and pax */}
            <div className="space-y-2.5 text-xs">
              {bookingServices.map(({ type, label }) => {
                const service = booking?.[type];

                return (
                  <div key={type} className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 font-medium">
                        {type === "venue" ? (
                          <Building2 className="size-3 text-muted-foreground" />
                        ) : (
                          <Utensils className="size-3 text-muted-foreground" />
                        )}
                        {label}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 tabular-nums text-muted-foreground">
                        <Users className="size-3" />
                        {service?.pax ?? "-"} pax
                      </span>
                    </div>
                    <p className="mt-0.5 pl-[18px] leading-4 text-muted-foreground">
                      {Formatter.bookingDateRange(service?.schedule)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Payment Summary */}
            <div className="mt-2.5 space-y-2 border-t border-[#ead5bc] pt-2.5 text-xs dark:border-border [&_svg]:size-3 [&_span]:gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="size-4" />
                  Total amount
                </span>

                <span className="font-medium tabular-nums">
                  {Formatter.amount(totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="size-4" />
                  Amount paid
                </span>

                <span className="font-medium tabular-nums">
                  {Formatter.amount(paidAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span
                  className={`flex items-center gap-2 font-semibold ${
                    outstandingBalance > 0
                      ? "text-red-700 dark:text-red-400"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  <Wallet className="size-4" />
                  Remaining balance
                </span>

                <span
                  className={`font-semibold tabular-nums ${
                    outstandingBalance > 0
                      ? "text-red-700 dark:text-red-400"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {Formatter.amount(outstandingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Outstanding Balance Warning */}
          {outstandingBalance > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2.5 dark:border-amber-900 dark:bg-amber-950/20">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />

              <div className="space-y-0.5">
                <p className="text-xs font-medium text-amber-950 dark:text-amber-200">
                  Outstanding balance
                </p>

                <p className="text-[11px] leading-4 text-amber-900/80 dark:text-amber-200/80">
                  The remaining balance can still be collected after the booking
                  is completed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <AlertDialogFooter className="flex-row justify-end gap-2 border-t border-[#ead7c3] px-4 py-3 dark:border-border">
          <AlertDialogCancel className="mt-0 h-8 border-[#ead7c3] bg-background px-3 text-xs dark:border-border">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={formSubmitted}
            onClick={(event) => {
              event.preventDefault();
              handleCompleted();
            }}
            className="h-8 bg-[#b8322d] px-3 text-xs font-medium text-white hover:bg-[#a12c28]"
          >
            Mark Completed
            <Spinner formSubmitted={formSubmitted} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompletedConfirmation;
