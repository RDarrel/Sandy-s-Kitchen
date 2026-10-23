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
import Spinner from "@/components/shared/spinner";
import { useSelector } from "react-redux";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUICK_REASONS = [
  {
    label: "Schedule Conflict",
    message:
      "Your selected date or time is unavailable. Please choose another schedule for your booking.",
  },
  {
    label: "Guest Count",
    message:
      "Please review and update your guest count to meet the requirements of your selected package or venue.",
  },
  {
    label: "Menu Availability",
    message:
      "Some of your selected dishes are unavailable. Please review and update your menu selections.",
  },
  {
    label: "Package Selection",
    message:
      "Your selected package may not meet your event requirements. Please review and update your package selection.",
  },
];

const RequestChanges = ({
  changeRequestOpen,
  changeRequestError,
  changeRequestReason,
  hasConflicts,
  setChangeRequestOpen,
  setChangeRequestReason,
  setChangeRequestError,
  handleRequestChanges,
}) => {
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  return (
    <AlertDialog
      open={changeRequestOpen}
      onOpenChange={(open) => {
        setChangeRequestOpen(open);
        if (!open) {
          setChangeRequestReason("");
          setChangeRequestError("");
        }
      }}
    >
      <AlertDialogContent
        className={`max-w-md ${hasConflicts ? "xl:left-[calc(50%-167px)]" : ""}`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Request changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            Provide the reason the customer needs to address before this booking
            can be approved.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <fieldset className="space-y-2" disabled={formSubmitted}>
            <legend className="text-xs font-medium text-muted-foreground">
              Suggested Reasons
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map(({ label, message }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={
                    "h-auto rounded-md px-2 py-1 text-xs shadow-none " +
                    (changeRequestReason === message
                      ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                      : "")
                  }
                  aria-pressed={changeRequestReason === message}
                  onClick={() => {
                    setChangeRequestReason(message);
                    setChangeRequestError("");
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </fieldset>
          <Textarea
            value={changeRequestReason}
            onChange={(e) => {
              setChangeRequestReason(e.target.value);
              if (e.target.value.trim()) setChangeRequestError("");
            }}
            placeholder="Enter the required changes..."
            className="min-h-28"
            disabled={formSubmitted}
          />

          {changeRequestError && (
            <p className="text-xs font-medium text-destructive">
              {changeRequestError}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={formSubmitted}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleRequestChanges();
            }}
            disabled={!changeRequestReason || formSubmitted}
          >
            Submit Request
            <Spinner formSubmitted={formSubmitted} />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RequestChanges;
