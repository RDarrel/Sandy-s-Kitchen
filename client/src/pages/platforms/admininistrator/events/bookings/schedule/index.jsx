import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_DOTS, STATUS_LABELS, STATUS_ORDER } from "../constant";
import EmptySchedule from "./emptySchedule";
import Booking from "./booking";
import ScheduleSkeleton from "./skeleton";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SCHEDULE } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";
import Approval from "./approval";
import ReviewPayment from "./reviewPayment";
import RecordPayment from "./recordPayment";
import grabCursor from "./cursors/grab.svg";
import grabbingCursor from "./cursors/grabbing.svg";
import useHorizontalDrag from "./useHorizontalDrag";

import {
  CompletedConfirmation,
  RejectionConfirmation,
  CancelConfirmation,
} from "./confirmation";

const EXPANDED_STATUSES = [
  "pending",
  "approved",
  "confirmed",
  "setup",
  "completed",
];

const Schedule = ({
  selectedDate,
  highlightedBookingId,
  onHighlightReady = () => {},
  onHighlightComplete = () => {},
  isExpanded = false,
  onToggleExpand,
}) => {
  const { isLoadingSchedule: isLoading, schedule = {} } = useSelector(
    ({ bookings }) => bookings,
  );
  const [activeStatus, setActiveStatus] = useState("all");
  const [approvalModalMode, setApprovalModalMode] = useState("approve");
  const [schedModal, setSchedModal] = useState({
    approved: false,
    reviewPayment: false,
    view: false,
    recordPayment: false,
    completed: false,
    reject: false,
    cancel: false,
  });
  const [selected, setSelected] = useState({});
  const [activeHighlightId, setActiveHighlightId] = useState(null);
  const dispatch = useDispatch();
  const bookingRefs = useRef({});
  const highlightTimeoutRef = useRef(null);
  const scheduleBodyRef = useRef(null);
  const statusFiltersRef = useRef(null);
  const statusColumnRefs = useRef({});

  const { filtered, count, statusHeader, bookingsArray } = useMemo(() => {
    const sortedSchedule = Object.fromEntries(
      Object.entries(schedule).sort(([keyA], [keyB]) => {
        const indexA = STATUS_ORDER.indexOf(keyA);
        const indexB = STATUS_ORDER.indexOf(keyB);

        return (
          (indexA === -1 ? Infinity : indexA) -
          (indexB === -1 ? Infinity : indexB)
        );
      }),
    );
    const bookings =
      activeStatus === "all"
        ? sortedSchedule
        : { [activeStatus]: sortedSchedule[activeStatus] || [] };
    const bookingsArray = Object.values(sortedSchedule)?.flat();
    return {
      filtered: bookings,
      count: bookingsArray?.length,
      bookingsArray,
      statusHeader: { all: bookingsArray, ...sortedSchedule },
    };
  }, [activeStatus, schedule]);

  useHorizontalDrag(scheduleBodyRef, isExpanded && !isLoading);
  useHorizontalDrag(statusFiltersRef, !isExpanded && !isLoading && count > 0, true);

  const populatedStatuses = Object.keys(schedule).filter(
    (status) => schedule[status]?.length > 0,
  );
  const solePopulatedStatus =
    populatedStatuses.length === 1 ? populatedStatuses[0] : null;

  useEffect(() => {
    const body = scheduleBodyRef.current;
    if (!body || isLoading) return;
    if (!isExpanded) {
      body.scrollLeft = 0;
      return;
    }
    if (activeStatus !== "all" || !solePopulatedStatus) return;

    // Let the width transition finish before centering the populated column.
    const timeoutId = setTimeout(() => {
      const column = statusColumnRefs.current[solePopulatedStatus];
      if (!column) return;

      const columnBounds = column.getBoundingClientRect();
      const bodyBounds = body.getBoundingClientRect();
      body.scrollTo({
        left:
          body.scrollLeft + columnBounds.left - bodyBounds.left -
          (body.clientWidth - columnBounds.width) / 2,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }, 220);

    return () => clearTimeout(timeoutId);
  }, [activeStatus, isExpanded, isLoading, solePopulatedStatus]);

  useEffect(() => {
    if (!isLoading && count === 0 && isExpanded) {
      onToggleExpand?.();
    }
  }, [count, isExpanded, isLoading, onToggleExpand]);

  const displayGroups =
    isExpanded && activeStatus === "all"
      ? EXPANDED_STATUSES.map((status) => [status, schedule[status] || []])
      : Object.entries(filtered);

  useEffect(() => {
    const promise = dispatch(
      SCHEDULE({ date: Formatter.localDate(new Date(selectedDate)) }),
    );
    return () => {
      promise.abort();
    };
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (!schedule[activeStatus]) {
      setActiveStatus("all");
    }
  }, [schedule, activeStatus]);

  useEffect(() => {
    setActiveStatus("all");
  }, [selectedDate]);

  const handleAction = useCallback((booking, _action) => {
    const approvalModalActions = ["view", "update", "setup"];
    const action = approvalModalActions.includes(_action)
      ? "approved"
      : _action;
    setSchedModal((prev) => ({ ...prev, [action]: !prev[action] }));
    setSelected(booking);

    setApprovalModalMode(_action);
  }, []);

  useEffect(() => {
    if (isLoading || !highlightedBookingId) return undefined;

    const targetExists = bookingsArray.some(
      (booking) => (booking._id || booking.id) === highlightedBookingId,
    );

    if (!targetExists) return undefined;

    const animationFrameId = requestAnimationFrame(() => {
      const target = bookingRefs.current[highlightedBookingId];

      if (!target) return;

      clearTimeout(highlightTimeoutRef.current);
      setActiveHighlightId(highlightedBookingId);
      onHighlightReady();
      onHighlightComplete();

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      highlightTimeoutRef.current = setTimeout(() => {
        setActiveHighlightId(null);
      }, 1200);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    activeStatus,
    bookingsArray,
    highlightedBookingId,
    isLoading,
    onHighlightComplete,
    onHighlightReady,
  ]);

  useEffect(() => {
    return () => clearTimeout(highlightTimeoutRef.current);
  }, []);

  if (isLoading) {
    return <ScheduleSkeleton selectedDate={selectedDate} />;
  }

  return (
    <>
      <Card className="flex h-[650px] w-full min-w-0 flex-col gap-0 overflow-hidden py-0 shadow-sm">
        <CardHeader
          className="min-w-0 gap-3 border-b px-3 !pb-0 pt-2.5"
          style={{
            "--schedule-grab-cursor": `url("${grabCursor}") 12 12, grab`,
            "--schedule-grabbing-cursor": `url("${grabbingCursor}") 12 12, grabbing`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate text-sm">
                {format(selectedDate, "MMM d, yyyy")}
                {/* {Formatter.date(selectedDate)} */}
              </CardTitle>

              <CardDescription className="text-xs">
                Selected schedule
              </CardDescription>
            </div>

            {count > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {count} booking
                {count !== 1 ? "s" : ""}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={`h-6 w-6 rounded-md text-muted-foreground hover:text-foreground [&_svg]:size-3.5 ${
                  isExpanded ? "bg-muted text-foreground" : ""
                }`}
                onClick={() => {
                  setActiveStatus("all");
                  onToggleExpand();
                }}
                aria-label={isExpanded ? "Collapse schedule" : "Expand schedule"}
                aria-pressed={isExpanded}
                title={isExpanded ? "Collapse schedule" : "Expand schedule"}
              >
                {isExpanded ? <Minimize2 /> : <Maximize2 />}
              </Button>
            </div>
            )}
          </div>

          {!isExpanded && count > 0 && (
            <div
              ref={statusFiltersRef}
              className="booking-schedule-draggable mb-3 flex min-w-0 flex-nowrap gap-1 overflow-x-hidden select-none [&_button]:cursor-[inherit]"
            >
              {["all", ...STATUS_ORDER]
                .filter((status) => statusHeader[status])
                .map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setActiveStatus(status)}
                    className={`inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-2 text-[11px] font-medium capitalize transition-colors ${
                      activeStatus === status
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {status !== "all" && (
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-full ${STATUS_DOTS[status]}`}
                      />
                    )}

                    {status === "all" ? "All" : STATUS_LABELS[status]}

                    <span className="tabular-nums">
                      {statusHeader[status]?.length}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </CardHeader>

        <CardContent
          ref={scheduleBodyRef}
          className={`booking-schedule-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 ${
            isExpanded ? "booking-schedule-draggable select-none" : ""
          }`}
          style={{
            "--schedule-grab-cursor": `url("${grabCursor}") 12 12, grab`,
            "--schedule-grabbing-cursor": `url("${grabbingCursor}") 12 12, grabbing`,
          }}
        >
          {count > 0 || isExpanded ? (
            <div
              className={
                isExpanded && activeStatus === "all"
                  ? "grid min-h-full grid-cols-[repeat(5,332px)] items-start gap-3"
                  : "space-y-3"
              }
            >
              {displayGroups.map(([status, bookings]) => (
                <section
                  key={status}
                  ref={(node) => {
                    statusColumnRefs.current[status] = node;
                  }}
                  className={
                    isExpanded
                      ? "w-[332px] min-w-0 space-y-2 rounded-lg border bg-muted/20 p-2"
                      : "space-y-2"
                  }
                >
                  {(activeStatus === "all" || isExpanded) && (
                    <div className="sticky top-0 z-10 flex items-center justify-between rounded-md bg-background/95 px-2 py-1 backdrop-blur">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className={`size-2 rounded-full ${STATUS_DOTS[status]}`}
                        />

                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {STATUS_LABELS[status]}
                        </h3>
                      </div>

                      <span className="text-[11px] font-medium text-muted-foreground">
                        {bookings.length}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {isExpanded && bookings.length === 0 && (
                      <EmptySchedule status={status} />
                    )}
                    {bookings.map((booking) => (
                      <Booking
                        key={booking._id}
                        ref={(node) => {
                          bookingRefs.current[booking._id || booking.id] = node;
                        }}
                        booking={booking}
                        handleAction={handleAction}
                        isHighlighted={
                          (booking._id || booking.id) === activeHighlightId
                        }
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptySchedule />
          )}
        </CardContent>
      </Card>

      <Approval
        isOpen={schedModal?.approved}
        setIsOpen={() => handleAction({}, "approved")}
        selected={selected}
        mode={approvalModalMode}
      />
      <ReviewPayment
        isOpen={schedModal?.reviewPayment}
        setIsOpen={() => handleAction({}, "reviewPayment")}
        selected={selected}
      />
      <RecordPayment
        isOpen={schedModal?.recordPayment}
        setIsOpen={() => handleAction({}, "recordPayment")}
        selected={selected}
      />
      <CompletedConfirmation
        isOpen={schedModal?.completed}
        setIsOpen={() => handleAction({}, "completed")}
        selected={selected}
      />
      <RejectionConfirmation
        isOpen={schedModal.reject}
        setIsOpen={(open) =>
          setSchedModal((prev) => ({ ...prev, reject: open }))
        }
        selected={selected}
      />
      <CancelConfirmation
        isOpen={schedModal.cancel}
        setIsOpen={(open) =>
          setSchedModal((prev) => ({ ...prev, cancel: open }))
        }
        selected={selected}
      />
    </>
  );
};

export default Schedule;
