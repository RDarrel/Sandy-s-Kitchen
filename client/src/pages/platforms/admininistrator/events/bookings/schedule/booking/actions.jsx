import { Button } from "@/components/ui/button";
import { useMemo } from "react";

const Actions = ({ booking, handleAction = () => {} }) => {
  const hasToReview = useMemo(() => {
    return booking?.payments.some(({ status }) => status === "pending");
  }, [booking?.payments]);
  return (
    <div className="flex flex-wrap justify-end gap-1.5 border-t bg-muted/10 px-2.5 py-2">
      <Button type="button" variant="outline" size="sm" className="h-7 px-2">
        View
      </Button>

      {booking.status === "pending" ? (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2"
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
          {hasToReview && (
            <Button
              type="button"
              onClick={() => handleAction(booking, "reviewPayment")}
              variant={booking?.status === "approved" ? "default" : "secondary"}
              size="sm"
              className="h-7 px-2"
            >
              Review Payment
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default Actions;
