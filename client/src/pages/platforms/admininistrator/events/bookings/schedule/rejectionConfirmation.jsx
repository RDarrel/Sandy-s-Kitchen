import { useId, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { CircleX, Users, Building2, Utensils } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { UPDATE } from "@/services/redux/slices/events/bookings";
import Spinner from "@/components/shared/spinner";
const QUICK_REASONS = [
  {
    label: "Schedule conflict",
    reason: "The requested date and time conflict with an existing booking.",
  },
  {
    label: "Venue unavailable",
    reason: "The venue is unavailable on the requested date.",
  },

  {
    label: "Service unavailable",
    reason:
      "One or more requested services are unavailable for the selected date.",
  },
  {
    label: "Incomplete details",
    reason: "The booking request contains incomplete or missing information.",
  },
  {
    label: "Unable to accommodate",
    reason:
      "We are unable to accommodate the specific requirements of this booking.",
  },
];

const RejectionConfirmation = ({ isOpen, setIsOpen, selected: booking }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const hasReason = reason.trim().length > 0;
  const dispatch = useDispatch();

  const handleOpenChange = (open) => {
    if (!open) setReason("");
    setIsOpen(open);
  };

  const bookingServices = [
    { type: "venue", label: "Venue" },
    { type: "catering", label: "Catering" },
  ].filter(
    ({ type }) =>
      booking?.bookingType === "both" || booking?.bookingType === type,
  );

  const handleReject = () => {
    dispatch(
      UPDATE({
        _id: booking?._id,
        status: "rejected",
        userId: auth?._id,
        reason,
        statusTransaction: { old: "pending", new: "rejected" },
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
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-lg border-[#ead7c3] bg-[#fffaf4] p-0 shadow-xl sm:max-w-[420px] dark:border-border dark:bg-background">
        {/* Header */}
        <AlertDialogHeader className="gap-1.5 px-4 pb-3 pt-4 text-left">
          <AlertDialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CircleX className="size-4 shrink-0 text-red-600" />
            Reject Booking?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs leading-4">
            Are you sure you want to reject this booking request?
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={reasonId} className="text-xs">
              Reason for rejection <span className="text-red-600">*</span>
            </Label>
            <div
              role="group"
              aria-label="Quick reasons"
              className="flex flex-wrap gap-1.5 pb-0.5"
            >
              {QUICK_REASONS.map((option) => {
                const isSelected = reason === option.reason;

                return (
                  <Button
                    key={option.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-pressed={isSelected}
                    onClick={() => setReason(option.reason)}
                    className={`h-7 px-2.5 text-xs shadow-none ${
                      isSelected
                        ? "border-red-600/40 bg-red-600/10 text-red-700 hover:bg-red-600/15 dark:text-red-400"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <Textarea
              id={reasonId}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this booking is being rejected..."
              className="min-h-20 resize-y bg-background text-[13px] md:text-[13px]"
              aria-describedby={`${reasonId}-hint`}
            />
            <p
              id={`${reasonId}-hint`}
              className="text-[11px] text-muted-foreground"
            >
              Please provide a reason for rejecting this booking.
            </p>
          </div>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="flex-row justify-end gap-2 border-t border-[#ead7c3] px-4 py-3 dark:border-border">
          <AlertDialogCancel className="mt-0 h-8 border-[#ead7c3] bg-background px-3 text-xs dark:border-border">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={!hasReason || formSubmitted}
            onClick={(event) => {
              event.preventDefault();
              handleReject();
            }}
            className="h-8 bg-[#b8322d] px-3 text-xs font-medium text-white hover:bg-[#a12c28]"
          >
            Reject Booking <Spinner formSubmitted={formSubmitted} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RejectionConfirmation;
