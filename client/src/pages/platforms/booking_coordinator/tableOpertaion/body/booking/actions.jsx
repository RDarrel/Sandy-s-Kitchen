import {
  Ban,
  Eye,
  MoreHorizontal,
  Pencil,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OPERATIONAL_STATUSES, STATUS_ACTIONS } from "../../constant";

const Actions = ({ booking, handleAction }) => {
  const { record } = booking;
  const status = record?.status;
  const action = STATUS_ACTIONS[record?.status];
  const ActionIcon = action?.icon;
  const viewOnly =
    ["changes_requested", "cancelled", "expired", "rejected"].includes(
      status,
    ) ||
    (status === "completed" && booking?.balance <= 0);

  if (viewOnly)
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAction(booking?.record, "view")}
        className="size-8 rounded-md border-border bg-card text-muted-foreground  y"
      >
        <Eye />
      </Button>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-md border-border bg-card text-muted-foreground  y"
          aria-label={`Actions for booking ${booking.id}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-60 rounded-lg p-1.5"
      >
        <DropdownMenuLabel className="px-2 py-2">
          <span className="block text-sm font-semibold">Booking actions</span>
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            {booking.id}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAction(booking?.record, "view")}
          className="cursor-pointer gap-2.5 rounded-md py-2 text-sm"
        >
          <Eye className="size-4 text-muted-foreground" />
          View booking details
        </DropdownMenuItem>

        {OPERATIONAL_STATUSES.includes(status) && (
          <>
            <DropdownMenuItem
              className="gap-2.5 rounded-md py-2 text-sm"
              onClick={() => handleAction(booking?.record, action?.nextStatus)}
            >
              <ActionIcon className="size-4" />
              {action?.label}
            </DropdownMenuItem>
          </>
        )}

        {status === "pending" && (
          <DropdownMenuItem
            className="gap-2.5 rounded-md py-2 text-sm text-destructive"
            onClick={() => handleAction(booking?.record, "reject")}
          >
            <XCircle className="size-4" />
            Reject booking
          </DropdownMenuItem>
        )}

        {["approved", "confirmed"].includes(status) && (
          <DropdownMenuItem
            className="gap-2.5 rounded-md py-2 text-sm"
            onClick={() => handleAction(booking?.record, "update")}
          >
            <Pencil className="size-4" />
            Edit booking
          </DropdownMenuItem>
        )}
        {(booking.pendingPayment > 0 || booking.paid < booking.amount) &&
          ["approved", "confirmed", "setup", "completed"].includes(status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Payments
              </DropdownMenuLabel>
              {booking.pendingPayment > 0 && (
                <DropdownMenuItem
                  onClick={() => handleAction(booking?.record, "reviewPayment")}
                  className="cursor-pointer gap-2.5 rounded-md py-2 text-sm font-medium text-primary focus:bg-primary/5 focus:text-primary"
                >
                  <Wallet className="size-4" />
                  Review payment
                  <span
                    aria-hidden="true"
                    className="ml-auto size-1.5 rounded-full bg-accent"
                  />
                </DropdownMenuItem>
              )}
              {booking.paid < booking.amount && (
                <DropdownMenuItem
                  className="gap-2.5 rounded-md py-2 text-sm"
                  onClick={() => handleAction(booking?.record, "recordPayment")}
                >
                  <Wallet className="size-4" />
                  Record a payment
                </DropdownMenuItem>
              )}
            </>
          )}
        {["approved", "confirmed"].includes(status) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction(booking?.record, "cancel")}
              className="gap-2.5 rounded-md py-2 text-sm text-destructive"
            >
              <Ban className="size-4" />
              Cancel booking
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;
