import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { STATUS_DOTS, STATUS_LABELS, STATUS_ORDER } from "../constant";
import EmptySchedule from "./emptySchedule";
import Booking from "./booking";

const Schedule = ({
  selectedBookings,
  selectedDate,
  selectedStatusCounts,
  selectedBookingsByStatus,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <Card className="flex h-[660px] flex-col gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="gap-3 border-b px-3 !pb-0 pt-2.5">
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

          <span className="shrink-0 rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {selectedBookings.length} booking
            {selectedBookings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {selectedBookings.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {["all", ...STATUS_ORDER]
              .filter((status) => selectedStatusCounts[status])
              .map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex h-6 items-center gap-1 rounded-md border px-2 text-[11px] font-medium capitalize transition-colors ${
                    statusFilter === status
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
                    {selectedStatusCounts[status]}
                  </span>
                </button>
              ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto p-3">
        {selectedBookingsByStatus.length > 0 ? (
          <div className="space-y-3">
            {selectedBookingsByStatus.map(({ status, bookings }) => (
              <section key={status} className="space-y-2">
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

                <div className="space-y-1.5">
                  {bookings.map((booking) => (
                    <Booking key={booking.id} booking={booking} />
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
  );
};

export default Schedule;
