import Spinner from "@/components/shared/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
const QUICK_REASONS = [
  "Proof is unreadable",
  "Payment information is incorrect",
  "Invalid transaction reference",
];

const RejectAlert = ({
  showRejectAlert = false,
  reason,
  setReason = () => {},
  setShowRejectAlert = () => {},
  handleReject = () => {},
}) => {
  const { formSubmitted } = useSelector(({ payments }) => payments);

  return (
    <>
      <AlertDialog open={showRejectAlert} onOpenChange={setShowRejectAlert}>
        <AlertDialogContent className="w-[calc(100%-1.5rem)] sm:max-w-[28rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject payment</AlertDialogTitle>
            <AlertDialogDescription>
              Add a reason before rejecting this payment.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={reason === item}
                  onClick={() => setReason(item)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-50 ${
                    reason === item ? "border-foreground bg-muted" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={3}
              placeholder="Type the reason for rejection..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={formSubmitted || !reason}
            >
              Reject <Spinner formSubmitted={formSubmitted} />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RejectAlert;
