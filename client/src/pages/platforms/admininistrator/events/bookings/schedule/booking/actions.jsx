import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";

const ADVANCEABLE_STATUSES = ["confirmed", "setup"];

const NEXT_STATUS = {
  confirmed: "setup",
  setup: "completed",
};

const Actions = ({ booking, handleAction = () => {} }) => {
  const hasToReview = useMemo(() => {
    return booking?.payments?.some(
      ({ status }) => status?.toLowerCase() === "pending",
    );
  }, [booking?.payments]);

  const isPaid = useMemo(() => {
    const paidAmount = booking?.payments
      ?.filter(({ status }) => status === "verified")
      ?.reduce((acc, curr) => acc + curr?.amount, 0);
    return paidAmount >= booking?.pricing?.total;
  }, [booking]);

  const { hasEdit, hasCollapseActions } = useMemo(() => {
    const status = booking?.status;

    if (status === "approved") {
      return { hasEdit: true, hasCollapseActions: false };
    }

    if (status === "confirmed") {
      return { hasEdit: true, hasCollapseActions: true };
    }

    return { hasEdit: false, hasCollapseActions: false };
  }, [booking?.status]);

  const isApproved = booking?.status === "approved";

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1.5 border-t bg-muted/10 px-2.5 py-2">
        {hasEdit && !hasCollapseActions && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction(booking, "update")}
            size="sm"
            className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
          >
            Update
          </Button>
        )}

        {!hasCollapseActions && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction(booking, "view")}
            size="sm"
            className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
          >
            View
          </Button>
        )}

        {booking?.status === "pending" ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAction(booking, "reject")}
              size="sm"
              className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
            >
              Reject
            </Button>

            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5"
              onClick={() => handleAction(booking, "approved")}
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
              <>
                {!isPaid ? (
                  <Button
                    type="button"
                    onClick={() => handleAction(booking, "recordPayment")}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 hover:bg-accent/40 hover:text-accent-foreground"
                  >
                    Record Payment
                  </Button>
                ) : null}
              </>
            )}

            {ADVANCEABLE_STATUSES.includes(booking?.status) && (
              <Button
                type="button"
                size="sm"
                className="h-7 px-2"
                onClick={() =>
                  handleAction(booking, NEXT_STATUS[booking.status])
                }
              >
                {NEXT_STATUS[booking.status] === "setup"
                  ? "Start Setup"
                  : "Mark Completed"}
              </Button>
            )}
          </>
        )}

        {hasCollapseActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-7"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAction(booking, "view")}>
                <Eye className="mr-2 size-4" />
                View
              </DropdownMenuItem>

              {hasEdit && (
                <DropdownMenuItem
                  onClick={() => handleAction(booking, "update")}
                >
                  <Pencil className="mr-2 size-4" />
                  Update
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </>
  );
};

export default Actions;
