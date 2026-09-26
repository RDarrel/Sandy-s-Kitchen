import { Badge } from "@/components/ui/badge";
import { Formatter, fullName } from "@/services/utilities";
import { AlertTriangle, Clock3 } from "lucide-react";
import { STATUS_STYLES } from "../../../constant";

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
        {/* Visible Connector - Desktop Only */}
        <div className="absolute -left-6 top-5 z-20 hidden h-4 w-6 -translate-y-1/2 items-center xl:flex">
          {/* Connector Line */}
          <span className="absolute inset-x-0 h-0.5 rounded-full bg-destructive/60" />

          {/* Dot Near Service Card */}
          <span className="absolute left-0 size-2 -translate-x-1/2 rounded-full border-2 border-background bg-destructive" />

          {/* Dot Near Conflict Panel */}
          <span className="absolute right-0 size-2 translate-x-1/2 rounded-full border-2 border-background bg-destructive" />
        </div>

        {/* Conflict Header */}
        <div className="rounded-t-lg border-b border-destructive/15 bg-destructive/[0.035] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-destructive">
                  {service.label} Conflict
                </p>

                <Badge
                  variant="outline"
                  className="h-5 shrink-0 border-destructive/20 bg-background px-1.5 text-[9px] text-destructive"
                >
                  {conflicts.length}
                </Badge>
              </div>

              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                {conflicts.length === 1
                  ? "This venue is already reserved at this time."
                  : `${conflicts.length} bookings conflict with this schedule.`}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Conflict List */}
        <div className="max-h-[280px] overflow-y-auto  [scrollbar-width:thin]">
          {conflicts.map((conflict, index) => (
            <ConflictBooking
              key={conflict._id}
              conflict={conflict}
              showDivider={index !== conflicts.length - 1}
            />
          ))}
        </div>

        {/* Conflict Footer */}
        <div className="rounded-b-lg border-t bg-muted/20 px-3 py-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-destructive" />

            <p className="text-[10px] leading-4 text-muted-foreground">
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
  return (
    <div className={`p-3 ${showDivider ? "border-b" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold">
              {conflict.reference}
            </span>
          </div>

          <p className="mt-1 truncate text-xs font-semibold">
            {conflict.eventType}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {fullName(conflict.customer?.fullName)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={`h-5 px-1.5 text-[9px] capitalize ${
            STATUS_STYLES[conflict.status] || ""
          }`}
        >
          {conflict.status}
        </Badge>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {/* Existing Booking Time */}
        <div className="rounded-md border bg-muted/10 px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
            <Clock3 className="size-2.5" />
            Existing
          </div>

          <p className="mt-1 whitespace-nowrap text-[10px] font-semibold">
            {Formatter.time(conflict.venue?.time.start)} -{" "}
            {Formatter.time(conflict.venue?.time.end)}
          </p>
        </div>

        {/* Overlap Time */}
        <div className="rounded-md border border-destructive/20 bg-destructive/[0.04] px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-destructive">
            <AlertTriangle className="size-2.5" />
            Overlap
          </div>

          <p className="mt-1 whitespace-nowrap text-[10px] font-semibold text-destructive">
            {Formatter.time(conflict.overlap.start)} -{" "}
            {Formatter.time(conflict.overlap.end)}
          </p>
        </div>
      </div>
    </div>
  );
};
