import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const ADVANCEABLE_STATUSES = ["confirmed", "setup"];

const NEXT_STATUS = {
  confirmed: "setup",
  setup: "completed",
};

const Actions = ({ booking, handleAction = () => {} }) => {
  const hasToReview = useMemo(() => {
    return booking?.payments?.some(({ status }) => status === "pending");
  }, [booking?.payments]);

  const isApproved = booking?.status === "approved";

  return (
    <div className="flex flex-wrap justify-end gap-1.5 border-t bg-muted/10 px-2.5 py-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleAction(booking, "view")}
        size="sm"
        className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
      >
        View
      </Button>

      {booking?.status === "pending" ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
          >
            Reject
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-7 px-2.5"
            onClick={() => handleAction(booking, "approval")}
          >
            Approve
          </Button>
        </>
      ) : (
        <>
          {hasToReview ? (
            <Button
              type="button"
              onClick={() => handleAction(booking, "reviewPayment")}
              variant={isApproved ? "default" : "secondary"}
              size="sm"
              className={
                isApproved
                  ? "h-7 px-2"
                  : "h-7 bg-accent px-2 text-accent-foreground hover:bg-accent/80"
              }
            >
              Review Payment
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => handleAction(booking, "recordPayment")}
              size="sm"
              variant="outline"
              className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
            >
              Record Payment
            </Button>
          )}

          {ADVANCEABLE_STATUSES.includes(booking?.status) && (
            <Button
              type="button"
              size="sm"
              className="h-7 px-2"
              onClick={() =>
                handleAction(
                  booking,
                  "updateStatus",
                  NEXT_STATUS[booking.status],
                )
              }
            >
              {NEXT_STATUS[booking.status] === "setup"
                ? "Start Setup"
                : "Mark Completed"}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default Actions;
