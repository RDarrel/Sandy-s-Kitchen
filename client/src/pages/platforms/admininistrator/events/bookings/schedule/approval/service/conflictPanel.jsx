import { Badge } from "@/components/ui/badge";
import { Formatter, fullName } from "@/services/utilities";
import { AlertTriangle, Clock3 } from "lucide-react";
import { STATUS_STYLES } from "../../../constant";

const formatSchedule = (schedule) => {
  if (!schedule?.startAt || !schedule?.endAt) {
    return "Schedule unavailable";
  }

  return Formatter.bookingDateRange({
    startAt: schedule.startAt,
    endAt: schedule.endAt,
  });
};

const ConflictPanel = ({ service, conflicts = [] }) => {
  return (
    <div
      className="
        mt-2
        xl:absolute
        xl:left-[calc(100%+1.5rem)]
        xl:top-0
        xl:z-50
        xl:mt-0
        xl:h-full
        xl:w-[310px]
      "
    >
      <div
        className="
          relative
          rounded-lg
          border
          border-destructive/25
          bg-background
          xl:sticky
          xl:top-4
          xl:shadow-xl
        "
      >
        {/* Desktop Connector */}
        <div className="absolute -left-6 top-5 z-20 hidden h-4 w-6 -translate-y-1/2 items-center xl:flex">
          <span className="absolute inset-x-0 h-0.5 rounded-full bg-destructive/60" />

          <span className="absolute left-0 size-2 -translate-x-1/2 rounded-full border-2 border-background bg-destructive" />

          <span className="absolute right-0 size-2 translate-x-1/2 rounded-full border-2 border-background bg-destructive" />
        </div>

        {/* Header */}
        <div className="rounded-t-lg border-b border-destructive/15 bg-destructive/[0.035] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-destructive">
                  {service?.label} Conflict
                </p>

                <Badge
                  variant="outline"
                  className="h-5 shrink-0 border-destructive/20 bg-background px-1.5 text-[10px] text-destructive"
                >
                  {conflicts.length}
                </Badge>
              </div>

              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                {conflicts.length === 1
                  ? "This venue is already reserved at this time."
                  : `${conflicts.length} bookings conflict with this schedule.`}
              </p>
            </div>
          </div>
        </div>

        {/* Conflict List */}
        <div className="max-h-[280px] overflow-y-auto [scrollbar-width:thin]">
          {conflicts.map((conflict, index) => (
            <ConflictBooking
              key={conflict._id}
              conflict={conflict}
              showDivider={index !== conflicts.length - 1}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="rounded-b-lg border-t bg-muted/20 px-3 py-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-destructive" />

            <p className="text-[11px] leading-4 text-muted-foreground">
              The selected venue is unavailable at this time. Request a venue or
              schedule change before approving this booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictPanel;

const ConflictBooking = ({ conflict, showDivider = false }) => {
  const existingSchedule = conflict?.venue?.schedule;
  const overlapSchedule = conflict?.overlap;

  return (
    <div className={`min-w-0 p-3 ${showDivider ? "border-b" : ""}`}>
      {/* Booking Details */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {conflict?.eventType || "Event"}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {fullName(conflict?.customer?.fullName)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="max-w-[110px] truncate text-xs font-semibold text-muted-foreground">
            {conflict?.reference}
          </span>

          <Badge
            variant="outline"
            className={`h-5 px-1.5 text-[10px] capitalize ${
              STATUS_STYLES[conflict?.status] || ""
            }`}
          >
            {conflict?.status}
          </Badge>
        </div>
      </div>

      {/* Schedules */}
      <div className="mt-2.5 space-y-1.5">
        {/* Existing Schedule */}
        <div className="min-w-0 rounded-md border bg-muted/10 px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <Clock3 className="size-3 shrink-0" />
            Existing Schedule
          </div>

          <p className="mt-1 break-words text-[11px] font-semibold leading-4">
            {formatSchedule(existingSchedule)}
          </p>
        </div>

        {/* Overlapping Schedule */}
        <div className="min-w-0 rounded-md border border-destructive/20 bg-destructive/[0.04] px-2.5 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
            <AlertTriangle className="size-3 shrink-0" />
            Overlapping Time
          </div>

          <p className="mt-1 break-words text-[11px] font-semibold leading-4 text-destructive">
            {formatSchedule(overlapSchedule)}
          </p>
        </div>
      </div>
    </div>
  );
};
