import { CalendarDays, ChevronRight, Clock3, Users } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardFeedback,
  ReportLink,
} from "../components";
import { UpcomingBookingsSkeleton } from "../skeletons";
import { useDispatch, useSelector } from "react-redux";
import { GET_UPCOMING_BOOKINGS } from "@/services/redux/slices/dashboard";
import { mapBooking } from "../data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const Upcoming = ({ errors }) => {
  const { upcomingBookings: bookingReport, isLoadingBookings } = useSelector(
    ({ dashboard }) => dashboard,
  );

  const dispatch = useDispatch();
  const upcomingBookings = (bookingReport?.bookings || []).map(mapBooking);

  const statuses = [
    {
      name: "Approved",
      count: Number(bookingReport?.statusCounts?.approved ?? 0),
      color: "bg-chart-4",
    },
    {
      name: "Confirmed",
      count: Number(bookingReport?.statusCounts?.confirmed ?? 0),
      color: "bg-primary",
    },
    {
      name: "Setup",
      count: Number(bookingReport?.statusCounts?.setup ?? 0),
      color: "bg-accent",
    },
  ];
  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-8">
      <CardHeader className="px-5 pb-0 pt-3">
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                Upcoming Bookings
              </CardTitle>
              <p className="text-xs leading-4 text-muted-foreground">
                Next scheduled events
              </p>
            </div>
          </div>
          <ReportLink to="/platforms/events/bookings">
            View All <ChevronRight className="size-3.5" aria-hidden="true" />
          </ReportLink>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col px-5">
        {isLoadingBookings ? (
          <UpcomingBookingsSkeleton />
        ) : errors.upcomingBookings ? (
          <DashboardFeedback
            error={errors.upcomingBookings}
            onRetry={() => dispatch(GET_UPCOMING_BOOKINGS())}
          />
        ) : upcomingBookings.length ? (
          <>
            <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 border-b py-3">
              <span className="text-[11px] text-muted-foreground">
                Upcoming
              </span>
              {statuses.map((status) => (
                <span
                  key={status.name}
                  className="inline-flex items-center gap-1.5 text-[11px]"
                >
                  <span
                    className={`size-1.5 rounded-full ${status.color}`}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{status.name}</span>
                  <span className="font-semibold tabular-nums">
                    {status.count}
                  </span>
                </span>
              ))}
            </div>
            <div className="flex flex-1 flex-col divide-y">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[44px_minmax(0,1fr)_88px] sm:gap-4 lg:min-h-[84px] lg:py-2.5"
                >
                  <div className="overflow-hidden rounded-lg border bg-card text-center">
                    <p className="bg-muted/60 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground">
                      {booking.month}
                    </p>
                    <p className="py-1 text-xl font-semibold leading-6 tabular-nums">
                      {booking.day}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium leading-5 lg:truncate"
                      title={booking.event}
                    >
                      {booking.event}
                    </p>
                    <p className="text-xs leading-4 text-muted-foreground">
                      {booking.service}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] leading-4 tabular-nums text-muted-foreground">
                      <p className="inline-flex min-w-0 items-start gap-1.5">
                        <Clock3
                          className="mt-0.5 size-3 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{booking.time}</span>
                      </p>
                      <p className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Users className="size-3 shrink-0" aria-hidden="true" />
                        <span>
                          {booking.guests == null
                            ? "Guests not specified"
                            : `${booking.guests} guests`}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="justify-self-end">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <DashboardEmptyState
            icon={CalendarDays}
            title="No upcoming bookings"
            description="Your next scheduled events will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Upcoming;

const StatusBadge = ({ status }) => (
  <Badge
    variant="outline"
    className={`gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${status === "Setup" ? "border-accent/30 bg-accent/10 text-foreground" : "border-primary/15 bg-primary/5 text-primary"}`}
  >
    <span
      className={`size-1 rounded-full ${status === "Setup" ? "bg-chart-3" : "bg-primary"}`}
    />
    {status}
  </Badge>
);
