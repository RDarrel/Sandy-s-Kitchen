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
