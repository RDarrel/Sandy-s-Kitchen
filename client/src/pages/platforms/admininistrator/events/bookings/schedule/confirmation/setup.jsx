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
import { CalendarDays, TriangleAlert } from "lucide-react";
import { Formatter, fullName } from "@/services/utilities";

const SetupConfirmation = ({
  isOpen,
  setIsOpen,
  selected: booking,
  onConfirm,
}) => {
  const services = [
    { type: "venue", label: "Venue" },
    { type: "catering", label: "Catering" },
  ].filter(
    ({ type }) =>
      booking?.bookingType === "both" || booking?.bookingType === type,
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-lg border-[#ead7c3] bg-[#fffaf4] p-0 shadow-xl sm:max-w-[420px] dark:border-border dark:bg-background">
        <AlertDialogHeader className="gap-1.5 px-4 pb-3 pt-4 text-left">
          <AlertDialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TriangleAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Start Setup Early?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-4">
            This booking is scheduled for a future date. Are you sure you want
            to start setup early?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 px-4 pb-3">
          <div className="rounded-md border border-[#ead5bc] bg-[#fff8f0] p-3 dark:border-border dark:bg-muted/20">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold">
                  {booking?.eventType || "Untitled Event"}
                </p>
                <p className="mt-0.5 break-words text-xs text-muted-foreground">
                  {fullName(booking?.customer?.fullName) || "Customer"}
                </p>
              </div>
              <span className="rounded border border-[#e9c9a4] px-1.5 py-0.5 text-[10px] font-medium text-[#805c3f] dark:border-border dark:text-foreground">
                {booking?.reference || "Booking"}
              </span>
            </div>
            <div className="mt-3 space-y-2 border-t border-[#ead5bc] pt-3 dark:border-border">
              {services.map(({ type, label }) => (
                <div key={type} className="flex items-start gap-2 text-xs">
                  <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium">{label} schedule</p>
                    <p className="mt-0.5 text-muted-foreground">
                      {Formatter.bookingDateRange(booking?.[type]?.schedule)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-amber-300 bg-amber-50 p-2.5 text-[11px] leading-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
            Continue to review the setup details before updating the booking
            status.
          </div>
        </div>
        <AlertDialogFooter className="flex-row justify-end gap-2 border-t border-[#ead7c3] px-4 py-3 dark:border-border">
          <AlertDialogCancel className="mt-0 h-8 border-[#ead7c3] bg-background px-3 text-xs dark:border-border">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="h-8 bg-[#b8322d] px-3 text-xs font-medium text-white hover:bg-[#a12c28]"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SetupConfirmation;
