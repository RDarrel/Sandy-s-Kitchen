import { GET_REFUNDS } from "@/services/redux/slices/events/bookings";
import { BROWSE as GET_PAYMENT_METHODS } from "@/services/redux/slices/events/paymentMethods";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Clock3,
  Loader2,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Formatter, fullName } from "@/services/utilities";
import RefundDetails from "./details";

const PendingRefunds = () => {
  const {
    refunds = [],
    isLoadingRefunds,
    calendar,
  } = useSelector(({ bookings }) => bookings);
  const { collections: paymentMethods = [] } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadRefunds = useCallback(async () => {
    setError("");
    try {
      await dispatch(GET_REFUNDS()).unwrap();
    } catch {
      setError("Unable to load pending refunds. Please try again.");
    }
  }, [dispatch]);

  useEffect(() => {
    loadRefunds();
    dispatch(GET_PAYMENT_METHODS());
  }, [dispatch, loadRefunds]);

  const count = calendar.overview?.financial?.pendingRefundCount;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="group h-9 gap-2 rounded-lg border-primary/20 bg-background py-1 pl-1 pr-2 text-foreground shadow-xs hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
            aria-label={
              isLoadingRefunds
                ? "Loading pending refunds"
                : error
                  ? "View pending refunds"
                  : `${count} pending refunds`
            }
            onClick={() => {
              setOpen(true);
              loadRefunds();
            }}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Wallet aria-hidden="true" className="size-3.5" />
            </span>
            <span className="text-xs font-medium">Pending Refunds</span>
            <span
              aria-hidden="true"
              className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-[10px] font-semibold leading-none text-primary-foreground tabular-nums"
            >
              {isLoadingRefunds ? (
                <Loader2 className="size-3 animate-spin" />
              ) : error ? (
                "—"
              ) : (
                count
              )}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {error
            ? "View pending refunds"
            : `${count} refunds awaiting processing`}
        </TooltipContent>
      </Tooltip>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setSelectedBooking(null);
        }}
      >
        <DialogContent
          overlayClassName="z-[80] bg-black/50 p-3 sm:p-4"
          className={`flex w-full max-w-xl flex-col gap-0 rounded-xl border-border bg-card p-0 text-card-foreground shadow-xl ${selectedBooking ? "[&>button:last-child]:hidden" : ""}`}
        >
          {selectedBooking ? (
            <RefundDetails
              key={selectedBooking._id}
              booking={selectedBooking}
              paymentMethods={paymentMethods}
              onBack={() => setSelectedBooking(null)}
              setBooking={setSelectedBooking}
            />
          ) : (
            <>
              <DialogHeader className="shrink-0 space-y-1 border-b bg-muted/20 px-3 py-3 pr-12 text-left sm:px-4">
                <DialogTitle className="flex items-center gap-2 text-base font-semibold tracking-normal">
                  <Wallet aria-hidden="true" className="size-4 text-primary" />
                  Pending Refunds
                  {!isLoadingRefunds && !error && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold leading-none text-primary tabular-nums">
                      {count}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-sm leading-5">
                  Cancelled bookings awaiting refund processing.
                </DialogDescription>
              </DialogHeader>

              <div
                className="min-h-0 space-y-2 overflow-y-auto overscroll-contain p-2.5 sm:p-3"
                aria-busy={isLoadingRefunds}
              >
                {isLoadingRefunds ? (
                  <div
                    role="status"
                    aria-label="Loading pending refunds"
                    className="space-y-2"
                  >
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="space-y-2.5 rounded-lg border bg-background p-2.5"
                      >
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-2.5 w-40" />
                        <div className="grid grid-cols-2 gap-2.5">
                          {[0, 1, 2, 3].map((field) => (
                            <Skeleton key={field} className="h-7 w-full" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div
                    role="alert"
                    className="space-y-2.5 rounded-lg border border-dashed px-3 py-6 text-center"
                  >
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-sm"
                      onClick={loadRefunds}
                    >
                      Try again
                    </Button>
                  </div>
                ) : count === 0 ? (
                  <div className="rounded-lg border border-dashed px-3 py-7 text-center">
                    <Wallet className="mx-auto mb-2 size-5 text-muted-foreground" />
                    <p className="text-sm font-medium">No pending refunds</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Refunds awaiting processing will appear here.
                    </p>
                  </div>
                ) : (
                  refunds.map((booking) => {
                    const { refund, cancelledAt, initiatedBy } =
                      booking.cancellation;
                    const hasRefundAccount = Boolean(
                      booking.cancellation?.refund?.accountProvidedBy,
                    );
                    const cancelledByLabel =
                      initiatedBy === "customer"
                        ? "Customer"
                        : initiatedBy === "business"
                          ? "Business"
                          : "Not available";
                    const needsCorrection =
                      refund.accountCorrection?.required === true;
                    const methodId = refund.method?._id ?? refund.method;
                    const methodName =
                      refund.method?.name ||
                      paymentMethods.find(({ _id }) => _id === methodId)?.name;
                    const accountNumber = String(
                      refund.accountNumber ?? "",
                    ).replace(/\s/g, "");
                    const maskedNumber =
                      accountNumber.length > 4
                        ? `•••• ${accountNumber.slice(-4)}`
                        : accountNumber
                          ? "•".repeat(accountNumber.length)
                          : "Not available";
                    const hasDate =
                      cancelledAt &&
                      !Number.isNaN(new Date(cancelledAt).getTime());

                    return (
                      <article
                        key={booking._id}
                        className="group overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary/30"
                      >
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="break-words text-sm font-semibold leading-5">
                                {booking.eventType || "Event booking"}
                              </h3>
                              {needsCorrection && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium leading-4 text-destructive">
                                  <TriangleAlert
                                    aria-hidden="true"
                                    className="size-3.5 shrink-0"
                                  />
                                  Account Update Required
                                </span>
                              )}
                            </div>
                            <p className="mt-1 break-words text-sm font-medium leading-5 text-foreground/80">
                              <span className="sr-only">Customer: </span>
                              {booking.customer?.fullName
                                ? fullName(booking.customer.fullName)
                                : "Customer unavailable"}
                            </p>
                            <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground">
                              {booking.reference}
                              {hasDate &&
                                `${booking.reference ? " · " : ""}Cancelled ${Formatter.date(cancelledAt, true)}`}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs leading-5 text-muted-foreground">
                              Cancelled by:
                              <Badge
                                variant="secondary"
                                className={
                                  initiatedBy === "business"
                                    ? "border-primary/20 bg-primary/10 px-1.5 py-0 text-primary"
                                    : "border-secondary-foreground/10 px-1.5 py-0"
                                }
                              >
                                {cancelledByLabel}
                              </Badge>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium leading-5 text-muted-foreground">
                              Refund amount
                            </p>
                            <p className="mt-0.5 text-lg font-semibold leading-6 tracking-tight text-primary tabular-nums">
                              {Formatter.amount(refund.amount)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border/60 bg-muted/20 px-3 py-1.5">
                          <div className="flex min-w-0 flex-1 items-center gap-2 text-xs leading-5">
                            {hasRefundAccount ? (
                              <>
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                                  <Wallet
                                    aria-hidden="true"
                                    className="size-3"
                                  />
                                </span>
                                <div className="min-w-0">
                                  <span className="break-words font-medium text-foreground">
                                    <span className="sr-only">
                                      Refund method:{" "}
                                    </span>
                                    {methodName || "Method unavailable"}
                                  </span>
                                  <span className="ml-2 inline-block text-muted-foreground tabular-nums">
                                    <span className="sr-only">
                                      Account number:{" "}
                                    </span>
                                    {maskedNumber}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                  <Clock3
                                    aria-hidden="true"
                                    className="size-3.5"
                                  />
                                </span>
                                <p className="min-w-0 font-medium text-amber-700 dark:text-amber-400">
                                  Awaiting refund account details
                                </p>
                              </>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 shrink-0 gap-1.5 rounded-md px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary [&_svg]:size-3.5"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View Details
                            <ArrowRight
                              aria-hidden="true"
                              className="size-3.5"
                            />
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

export default PendingRefunds;
