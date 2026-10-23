import { GET_CANCELLED_BOOKINGS } from "@/services/redux/slices/events/bookings";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  CircleMinus,
  Clock3,
  ReceiptText,
} from "lucide-react";
import CancelledDetails from "./details";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Formatter, fullName } from "@/services/utilities";

const CancelledDialog = ({ open, onOpenChange }) => {
  const {
    cancelledBookings = [],
    isLoadingCancelledBookings,
    calendar,
  } = useSelector(({ bookings }) => bookings);
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { startAt, endAt } = calendar?.monthRange ?? {};
  const hasMonthRange =
    startAt &&
    endAt &&
    !Number.isNaN(new Date(startAt).getTime()) &&
    !Number.isNaN(new Date(endAt).getTime());
  const startDate = hasMonthRange ? Formatter.localDate(startAt) : null;
  const inclusiveEnd = hasMonthRange ? new Date(endAt) : null;
  if (inclusiveEnd) inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);
  const endDate = inclusiveEnd ? Formatter.localDate(inclusiveEnd) : null;
  const bookings = Array.isArray(cancelledBookings) ? cancelledBookings : [];

  const loadBookings = useCallback(async () => {
    setError("");
    if (!startDate || !endDate) {
      setError("Please wait for the calendar date range to load.");
      return;
    }
    try {
      await dispatch(GET_CANCELLED_BOOKINGS({ startDate, endDate })).unwrap();
    } catch {
      setError("Unable to load cancelled bookings. Please try again.");
    }
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    if (open) loadBookings();
  }, [open, loadBookings]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          onOpenChange(value);
          if (!value) setSelectedBooking(null);
        }}
      >
        <DialogContent
          overlayClassName="z-[100] bg-black/50 p-3 sm:p-4"
          className={`flex w-full max-w-xl flex-col gap-0 rounded-xl bg-card p-0 text-card-foreground ${selectedBooking ? "[&>button:last-child]:hidden" : ""}`}
        >
          {selectedBooking ? (
            <CancelledDetails
              booking={selectedBooking}
              onBack={() => setSelectedBooking(null)}
            />
          ) : (
            <>
              <DialogHeader className="shrink-0 space-y-1 border-b bg-muted/15 px-4 py-3 pr-12 text-left">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                    <ReceiptText
                      aria-hidden="true"
                      className="size-4 text-primary"
                    />
                    Cancelled Bookings
                    {!isLoadingCancelledBookings && !error && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary tabular-nums">
                        {bookings.length}
                      </span>
                    )}
                  </DialogTitle>
                  {hasMonthRange && (
                    <p className="flex items-center gap-1.5 text-xs font-medium leading-5 text-muted-foreground">
                      <CalendarDays
                        aria-hidden="true"
                        className="size-3.5 shrink-0"
                      />
                      <span>
                        {Formatter.monthRange(startAt, endAt)}
                      </span>
                    </p>
                  )}
                </div>
                <DialogDescription className="text-xs leading-5">
                  Cancelled bookings and their refund details for the selected
                  date range.
                </DialogDescription>
              </DialogHeader>

              <div
                className="min-h-0 space-y-2 overflow-y-auto overscroll-contain p-3"
                aria-busy={isLoadingCancelledBookings}
              >
                {isLoadingCancelledBookings ? (
                  <div
                    role="status"
                    aria-label="Loading cancelled bookings"
                    className="space-y-2"
                  >
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="space-y-3 rounded-lg border p-3"
                      >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div role="alert" className="space-y-3 py-8 text-center">
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadBookings}
                    >
                      Try again
                    </Button>
                  </div>
                ) : !bookings.length ? (
                  <div className="rounded-lg border border-dashed px-3 py-8 text-center">
                    <ReceiptText className="mx-auto mb-2 size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">No cancelled bookings</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No cancelled bookings were found in this calendar range.
                    </p>
                  </div>
                ) : (
                  bookings.map((booking) => {
                    const cancellation = booking.cancellation ?? {};
                    const refund = cancellation.refund ?? {};
                    const totalPaid = Number(cancellation.totalPaid ?? 0);
                    const retained = Math.min(
                      totalPaid,
                      Number(cancellation.nonRefundableAmount ?? 0),
                    );
                    const hasRefundStatus =
                      (refund.status ?? "none") !== "none";
                    const hasRefund =
                      hasRefundStatus && Number(refund.amount) > 0;
                    const completed =
                      hasRefund && refund.status === "completed";
                    const pending = hasRefund && refund.status === "pending";
                    const hasDate =
                      cancellation.cancelledAt &&
                      !Number.isNaN(
                        new Date(cancellation.cancelledAt).getTime(),
                      );
                    return (
                      <article
                        key={booking._id}
                        className="overflow-hidden rounded-lg border bg-background"
                      >
                        <div className="flex items-start justify-between gap-3 px-3 pb-2 pt-2.5">
                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-semibold">
                              {booking.eventType || "Event booking"}
                            </h3>
                            <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
                              {booking.reference && (
                                <span className="mr-2 font-medium text-foreground/75">
                                  {booking.reference}
                                </span>
                              )}
                              {booking.customer?.fullName
                                ? fullName(booking.customer.fullName)
                                : "Customer unavailable"}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
                              Cancelled by:
                              <Badge
                                variant="secondary"
                                className={
                                  cancellation.initiatedBy === "business"
                                    ? "border-primary/20 bg-primary/10 px-1.5 py-0 text-primary"
                                    : "border-secondary-foreground/10 px-1.5 py-0"
                                }
                              >
                                {cancellation.initiatedBy === "business"
                                  ? "Business"
                                  : cancellation.initiatedBy === "customer"
                                    ? "Customer"
                                    : "Not available"}
                              </Badge>
                            </p>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${completed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : pending ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}
                          >
                            {completed ? (
                              <CircleCheck
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              />
                            ) : hasRefund ? (
                              <Clock3
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              />
                            ) : (
                              <CircleMinus
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              />
                            )}
                            {completed
                              ? "Refund completed"
                              : pending
                                ? "Refund pending"
                                : hasRefund
                                  ? "Refund due"
                                  : "No Refund"}
                          </span>
                        </div>
                        <dl className="grid grid-cols-3 gap-2 px-3 pb-2.5">
                          <Amount label="Total Paid" value={totalPaid} />
                          <Amount label="Retained Payment" value={retained} />
                          <Amount
                            label="Refund Amount"
                            value={refund.amount}
                            primary
                          />
                        </dl>
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t bg-muted/15 px-3 py-1.5">
                          <p className="flex min-w-0 items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                            <Clock3
                              aria-hidden="true"
                              className="mt-0.5 size-3.5 shrink-0"
                            />
                            <span>
                              Cancelled{" "}
                              {hasDate
                                ? Formatter.date(cancellation.cancelledAt, true)
                                : "— date unavailable"}
                            </span>
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 gap-1.5 px-2 text-xs text-primary hover:bg-primary/5 hover:text-primary [&_svg]:size-3.5"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                            <ArrowRight aria-hidden="true" />
                          </Button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const Amount = ({ label, value, primary = false }) => (
  <div className="min-w-0 space-y-0.5">
    <dt className="text-[11px] leading-4 text-muted-foreground">{label}</dt>
    <dd
      className={`break-words text-sm font-semibold leading-5 tabular-nums ${primary ? "text-primary" : ""}`}
    >
      {Formatter.amount(value || 0)}
    </dd>
  </div>
);

export default CancelledDialog;
