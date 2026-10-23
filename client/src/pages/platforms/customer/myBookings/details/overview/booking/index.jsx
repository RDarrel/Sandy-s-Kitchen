import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Cancellation from "./cancellation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Formatter } from "@/services/utilities";
import { ChevronDown, Pencil, XCircle } from "lucide-react";
import { getBookingUpdateTitle, prepareBookingEdt } from "../../../utils";
import { Button } from "@/components/ui/button";

const NOTICE_ICON_TONE = {
  payment: "text-amber-600 dark:text-amber-400",
  "action-required": "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
  preparing: "text-violet-600 dark:text-violet-400",
  default: "text-muted-foreground",
};

const BookingOverview = ({ booking, status, date, action }) => {
  const navigate = useNavigate();
  const [showCancellation, setShowCancellation] = useState(false);

  const StatusIcon = status.icon;
  const ActionIcon = action.icon;
  const iconTone = NOTICE_ICON_TONE[action.variant] || NOTICE_ICON_TONE.default;
  const actionMessage = action?.reason?.trim() || action.message;
  const updateTitle = getBookingUpdateTitle(booking, action);
  const isCancelled = booking?.status === "cancelled";
  const cancelledAt = booking?.cancellation?.cancelledAt;
  const hasCancellationDate =
    cancelledAt && !Number.isNaN(new Date(cancelledAt).getTime());

  const canEditBooking = ["pending", "changes_requested"].includes(
    booking?.status,
  );

  const canCancelBooking = [
    "pending",
    "changes_requested",
    "approved",
    "confirmed",
  ].includes(booking?.status);

  const canManageBooking = canEditBooking || canCancelBooking;

  const handleEdit = () => {
    const path = prepareBookingEdt(booking, action?.reason);
    navigate(path);
  };

  const handleCancel = () => {
    setShowCancellation(true);
  };

  return (
    <>
    <section className="overflow-hidden rounded-lg border bg-card">
      {/* Booking identity */}
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* Date */}
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/20">
            <span className="text-[9px] font-semibold uppercase leading-none text-muted-foreground">
              {date.month}
            </span>

            <span className="mt-1 text-lg font-bold leading-none">
              {date.day}
            </span>
          </div>

          {/* Main booking info */}
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="truncate text-base font-semibold leading-5 sm:text-lg">
                {booking?.eventType || "Event booking"}
              </h1>

              <span
                className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-medium ${status.badgeClassName}`}
              >
                <StatusIcon className="size-3" />
                {status.label}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>
                Starts {date.weekday}, {Formatter.date(booking?.date)}
              </span>

              <span className="size-1 rounded-full bg-border" />

              <span>Submitted {Formatter.date(booking?.createdAt)}</span>
            </div>

            {/* Mobile reference */}
            <p className="mt-1 font-mono text-[10px] font-medium text-muted-foreground sm:hidden">
              #{booking?.reference}
            </p>
          </div>
        </div>

        {/* Desktop reference */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Booking reference
          </p>

          <p className="mt-1 font-mono text-xs font-semibold">
            {booking?.reference}
          </p>
        </div>
      </div>

      {/* Current booking state */}
      <div className="border-t border-border/60">
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-3 gap-y-2 bg-muted/20 px-3 py-2">
          <p className="flex min-w-0 items-center gap-2 text-xs font-semibold leading-5">
            <ActionIcon
              aria-hidden="true"
              className={`size-4 shrink-0 ${iconTone}`}
            />
            <span className="min-w-0 break-words">{updateTitle}</span>
          </p>
        {canManageBooking && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
              >
                Manage booking
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              {/* {canEditBooking && ( */}
              <DropdownMenuItem className="gap-2 text-xs" onClick={handleEdit}>
                <Pencil className="size-3.5" />
                Edit booking
              </DropdownMenuItem>
              {/* )} */}

              {canEditBooking && canCancelBooking && <DropdownMenuSeparator />}

              {canCancelBooking && (
                <DropdownMenuItem
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                  onClick={handleCancel}
                >
                  <XCircle className="size-3.5" />
                  Cancel booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
        <div className="space-y-2 px-3 py-2.5">
          <p className="whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">
            {actionMessage}
          </p>
          {isCancelled && (
            <dl className="grid gap-3 border-t border-border/50 pt-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
              <div className="min-w-0 space-y-0.5">
                <dt className="text-[11px] leading-4 text-muted-foreground">
                  Reason for cancellation
                </dt>
                <dd className="whitespace-pre-wrap break-words text-xs font-medium leading-5 text-foreground">
                  {booking?.cancellation?.reason?.trim() || "No reason provided."}
                </dd>
              </div>
              <div className="min-w-0 space-y-0.5 text-right">
                <dt className="text-[11px] leading-4 text-muted-foreground">
                  Cancelled on
                </dt>
                <dd className="text-xs font-medium leading-5 text-foreground">
                  {hasCancellationDate
                    ? Formatter.date(cancelledAt, true)
                    : "Not available"}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </section>
    {showCancellation && (
      <Cancellation booking={booking} onClose={() => setShowCancellation(false)} />
    )}
    </>
  );
};

export default BookingOverview;
