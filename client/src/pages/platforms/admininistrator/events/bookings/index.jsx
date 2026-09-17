"use client";

import { useMemo, useState } from "react";
import { EventCalendar } from "@/components/reui/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content";
import { EventCalendarNav } from "@/components/reui/event-calendar/event-calendar-nav";
import {
  addDays,
  addMinutes,
  format,
  setHours,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { Clock3, MapPin, Phone, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BOOKING_STREAMS = [
  { id: "catering", title: "Catering", color: "var(--color-rose-500)" },
  { id: "venue", title: "Venue", color: "var(--color-amber-500)" },
  {
    id: "full-service",
    title: "Catering + Venue",
    color: "var(--color-emerald-500)",
  },
];

const statusStyles = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  setup: "border-sky-200 bg-sky-50 text-sky-700",
  completed: "border-violet-200 bg-violet-50 text-violet-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusLabels = {
  approved: "approved",
  pending: "pending",
  setup: "setup",
  completed: "done",
  cancelled: "cancelled",
};

const statusDots = {
  approved: "bg-emerald-500",
  pending: "bg-amber-500",
  setup: "bg-sky-500",
  completed: "bg-violet-500",
  cancelled: "bg-rose-500",
};

const statusText = {
  approved: "text-emerald-700",
  pending: "text-amber-700",
  setup: "text-sky-700",
  completed: "text-violet-700",
  cancelled: "text-rose-700",
};

const statusBorders = {
  approved: "border-l-emerald-500",
  pending: "border-l-amber-500",
  setup: "border-l-sky-500",
  completed: "border-l-violet-500",
  cancelled: "border-l-rose-500",
};

const statusOrder = ["pending", "approved", "setup", "completed", "cancelled"];

const statusColors = {
  approved: "var(--color-emerald-500)",
  pending: "var(--color-amber-500)",
  setup: "var(--color-sky-500)",
  completed: "var(--color-violet-500)",
  cancelled: "var(--color-rose-500)",
};

const paymentStyles = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  partial: "border-blue-200 bg-blue-50 text-blue-700",
  unpaid: "border-rose-200 bg-rose-50 text-rose-700",
};

const serviceBadges = {
  "Catering + Venue": {
    label: "C+V",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "Dinner buffet + venue": {
    label: "C+V",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "Venue reservation": {
    label: "VEN",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  "Packed buffet": {
    label: "CAT",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  "Catering only": {
    label: "CAT",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  "Blocked venue": {
    label: "BLK",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

function buildBookingEvents(anchor) {
  const week = startOfWeek(startOfDay(anchor), { weekStartsOn: 0 });
  const at = (dayOffset, hour, minute = 0) =>
    addMinutes(setHours(addDays(week, dayOffset), hour), minute);

  return [
    {
      id: "santos-wedding",
      title: "Santos Wedding",
      start: at(2, 10),
      end: at(2, 14),
      resourceId: "full-service",
      color: statusColors.approved,
      meta: {
        customer: "Angela Santos",
        service: "Catering + Venue",
        venue: "Garden Pavilion",
        guests: 120,
        status: "approved",
        payment: "partial",
        contact: "0917 234 8890",
      },
    },
    {
      id: "cruz-birthday",
      title: "Cruz 18th Birthday",
      start: at(3, 16),
      end: at(3, 20),
      resourceId: "venue",
      color: statusColors.pending,
      meta: {
        customer: "Liza Cruz",
        service: "Venue reservation",
        venue: "Function Hall A",
        guests: 80,
        status: "pending",
        payment: "unpaid",
        contact: "0998 112 4501",
      },
    },
    {
      id: "lim-corporate-lunch",
      title: "Lim Corporate Lunch",
      start: at(4, 11),
      end: at(4, 13),
      resourceId: "catering",
      color: statusColors.approved,
      meta: {
        customer: "Lim Trading",
        service: "Packed buffet",
        venue: "Client office",
        guests: 45,
        status: "approved",
        payment: "paid",
        contact: "0916 555 2210",
      },
    },
    {
      id: "garcia-reunion",
      title: "Garcia Reunion",
      start: at(4, 15),
      end: at(4, 19),
      resourceId: "full-service",
      color: statusColors.setup,
      meta: {
        customer: "Garcia Family",
        service: "Catering + Venue",
        venue: "Main Dining Hall",
        guests: 95,
        status: "setup",
        payment: "partial",
        contact: "0927 443 7109",
      },
    },
    {
      id: "flores-venue-ocular",
      title: "Flores Ocular Visit",
      start: at(4, 17, 30),
      end: at(4, 18, 30),
      resourceId: "venue",
      color: statusColors.pending,
      meta: {
        customer: "Nina Flores",
        service: "Venue reservation",
        venue: "Garden Pavilion",
        guests: 25,
        status: "pending",
        payment: "unpaid",
        contact: "0905 882 3300",
      },
    },
    {
      id: "dela-pena-baptism",
      title: "Dela Pena Baptism",
      start: at(6, 9),
      end: at(6, 12),
      resourceId: "catering",
      color: statusColors.approved,
      meta: {
        customer: "Mark Dela Pena",
        service: "Catering only",
        venue: "St. Joseph Parish Hall",
        guests: 60,
        status: "approved",
        payment: "paid",
        contact: "0918 700 1911",
      },
    },
    {
      id: "navarro-anniversary",
      title: "Navarro Anniversary",
      start: at(9, 18),
      end: at(9, 22),
      resourceId: "full-service",
      color: statusColors.pending,
      meta: {
        customer: "Mia Navarro",
        service: "Dinner buffet + venue",
        venue: "Garden Pavilion",
        guests: 50,
        status: "pending",
        payment: "unpaid",
        contact: "0917 222 4135",
      },
    },
    {
      id: "reyes-thanksgiving",
      title: "Reyes Thanksgiving",
      start: at(17, 12),
      end: at(17, 16),
      resourceId: "catering",
      color: statusColors.completed,
      meta: {
        customer: "Jon Reyes",
        service: "Catering only",
        venue: "Private residence",
        guests: 70,
        status: "completed",
        payment: "paid",
        contact: "0999 808 4412",
      },
    },
  ];
}

function renderBookingEvent({ occurrence }) {
  const { event } = occurrence;
  const meta = event.meta;
  const service = serviceBadges[meta?.service];

  if (!meta) return undefined;

  return (
    <span className="flex w-full min-w-0 items-center gap-1.5" title="">
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full ${statusDots[meta.status]}`}
      />
      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
      {service && (
        <span
          className={`ms-auto shrink-0 rounded border px-1 text-[9px] font-bold leading-4 ${service.className}`}
        >
          {service.label}
        </span>
      )}
    </span>
  );
}

function renderBookingTooltip({ occurrence }) {
  const { event } = occurrence;
  const meta = event.meta;

  if (!meta) return event.title;

  return (
    <div className="w-64 space-y-3 text-sm">
      <div>
        <p className="font-semibold">{event.title}</p>
        <p className="text-xs text-muted-foreground">{meta.customer}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant="outline"
          className={`capitalize ${statusStyles[meta.status]}`}
        >
          {meta.status}
        </Badge>
        <Badge
          variant="outline"
          className={`capitalize ${paymentStyles[meta.payment]}`}
        >
          {meta.payment}
        </Badge>
      </div>
      <div className="grid gap-1 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">
            {event.allDay
              ? "All day"
              : `${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")}`}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Service</span>
          <span className="font-medium">{meta.service}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Venue</span>
          <span className="font-medium text-right">{meta.venue}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Guests</span>
          <span className="font-medium">{meta.guests} pax</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Contact</span>
          <span className="font-medium">{meta.contact}</span>
        </div>
      </div>
    </div>
  );
}

function renderMoreIndicator({ count }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border bg-background px-2 text-[10px] font-semibold text-muted-foreground shadow-sm">
      +{count} more
    </span>
  );
}

function renderBookingMonthCell({
  day,
  segments,
  isToday,
  isOutside,
  selectedDay,
}) {
  const bookings = [...segments.allDay, ...segments.timed]
    .map((segment) => segment.occurrence.event)
    .filter((event) => event.meta);

  const statusCounts = bookings.reduce((counts, event) => {
    const status = event.meta.status;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const visibleStatuses = statusOrder.filter((status) => statusCounts[status]);
  const priorityStatus =
    visibleStatuses.find((status) => status === "pending") ||
    visibleStatuses.find((status) => status === "setup") ||
    visibleStatuses.find((status) => status === "approved") ||
    visibleStatuses[0];
  const displayStatuses = priorityStatus
    ? [
        priorityStatus,
        ...visibleStatuses.filter((status) => status !== priorityStatus),
      ]
    : [];
  const isSelected =
    format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col gap-1.5 px-2 py-1.5 transition-colors ${
        isSelected ? "bg-muted/25 ring-1 ring-border" : ""
      }`}
    >
      <div className="flex min-h-5 items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          {bookings.length > 0
            ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""}`
            : ""}
        </span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[12px] font-medium ${
            isToday
              ? "bg-primary text-primary-foreground"
              : isOutside
                ? "text-muted-foreground"
                : "text-foreground"
          }`}
        >
          {format(day, "d")}
        </span>
      </div>

      {bookings.length > 0 && (
        <div className="min-w-0 space-y-0.5">
          {displayStatuses.map((status) => (
            <div
              key={status}
              className={`flex min-w-0 items-center gap-1.5 border-l-2 pl-1.5 text-[11px] leading-4 ${statusBorders[status]}`}
            >
              <span className="min-w-0 flex-1 truncate font-medium capitalize text-foreground">
                {statusLabels[status]}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {statusCounts[status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking }) {
  const meta = booking.meta;
  const service = serviceBadges[meta.service];

  return (
    <div className="rounded-md border bg-background p-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-semibold leading-5">
              {booking.title}
            </p>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {statusLabels[meta.status]}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {meta.customer}
          </p>
        </div>
        {service && (
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] ${service.className}`}
          >
            {service.label}
          </Badge>
        )}
      </div>

      <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock3 className={`size-3.5 shrink-0 ${statusText[meta.status]}`} />
          <span className="font-medium text-foreground">
            {format(booking.start, "h:mm a")} - {format(booking.end, "h:mm a")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate font-medium text-foreground">
            {meta.venue}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <UsersRound className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">
              {meta.guests} pax
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <Phone className="size-3.5 shrink-0" />
            <span className="truncate font-medium text-foreground">
              {meta.contact}
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-muted-foreground">{meta.service}</span>
          <Badge
            variant="outline"
            className={`capitalize ${paymentStyles[meta.payment]}`}
          >
            {meta.payment}
          </Badge>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-end gap-1.5 border-t pt-2">
        <Button type="button" variant="outline" size="sm" className="h-7 px-2">
          View
        </Button>
        {meta.status === "pending" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              Reject
            </Button>
            <Button type="button" size="sm" className="h-7 px-2.5">
              Approve
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            Manage
          </Button>
        )}
      </div>
    </div>
  );
}

function Bookings() {
  const events = useMemo(() => buildBookingEvents(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(
    () =>
      events.find((event) => event.id === "lim-corporate-lunch")?.start ??
      new Date(),
  );
  const [statusFilter, setStatusFilter] = useState("pending");

  const selectDate = (date) => {
    const key = format(date, "yyyy-MM-dd");
    const dayBookings = events.filter(
      (event) => format(event.start, "yyyy-MM-dd") === key,
    );

    setSelectedDate(date);
    setStatusFilter(
      dayBookings.some((booking) => booking.meta.status === "pending")
        ? "pending"
        : "all",
    );
  };

  const selectedBookings = useMemo(() => {
    const selectedKey = format(selectedDate, "yyyy-MM-dd");

    return events
      .filter((event) => format(event.start, "yyyy-MM-dd") === selectedKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  const selectedBookingsByStatus = useMemo(() => {
    const filteredBookings =
      statusFilter === "all"
        ? selectedBookings
        : selectedBookings.filter(
            (booking) => booking.meta.status === statusFilter,
          );

    return statusOrder
      .map((status) => ({
        status,
        bookings: filteredBookings.filter(
          (booking) => booking.meta.status === status,
        ),
      }))
      .filter((group) => group.bookings.length > 0);
  }, [selectedBookings, statusFilter]);

  const selectedStatusCounts = useMemo(() => {
    return selectedBookings.reduce(
      (counts, booking) => ({
        ...counts,
        [booking.meta.status]: (counts[booking.meta.status] || 0) + 1,
      }),
      { all: selectedBookings.length },
    );
  }, [selectedBookings]);

  return (
    <div className="w-full p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="w-full py-0">
          <CardContent className="p-0">
            <EventCalendar
              defaultEvents={events}
              defaultView="month"
              resources={BOOKING_STREAMS}
              renderEvent={renderBookingEvent}
              renderEventTooltip={renderBookingTooltip}
              renderMoreIndicator={renderMoreIndicator}
              renderMonthCell={(props) =>
                renderBookingMonthCell({ ...props, selectedDay: selectedDate })
              }
              interactions={{ drag: false, resize: false, selectSlot: false }}
              onSlotClick={({ date }) => selectDate(date)}
              onEventClick={(occurrence) =>
                selectDate(occurrence.start ?? occurrence.event.start)
              }
              maxEventsPerCell={3}
              viewSettings={{
                weekends: true,
                weekNumbers: false,
                nowIndicator: true,
                offDays: false,
              }}
              eventTooltip
              showDayAddButton={false}
              offDays
              className="h-[620px] w-full"
              classNames={{
                monthCell: "cursor-pointer hover:bg-muted/40 transition-colors",
                monthCellContent: "gap-1",
                moreIndicator: "mt-0.5 px-1",
              }}
            >
              <div className="flex flex-wrap items-center gap-2 pe-2">
                <EventCalendarNav className="min-w-0 flex-1" />
              </div>
              <EventCalendarContent />
            </EventCalendar>
          </CardContent>
        </Card>

        <Card className="flex h-[620px] flex-col gap-0 overflow-hidden py-0 shadow-sm">
          <CardHeader className="gap-2 border-b px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="truncate text-sm">
                  {format(selectedDate, "MMM d, yyyy")}
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
              <div className="flex flex-wrap gap-1">
                {["all", ...statusOrder]
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
                          className={`size-1.5 rounded-full ${statusDots[status]}`}
                        />
                      )}
                      {status === "all" ? "All" : statusLabels[status]}
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
                          className={`size-2 rounded-full ${statusDots[status]}`}
                        />
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {statusLabels[status]}
                        </h3>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {bookings.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {bookings.map((booking) => (
                        <BookingRow key={booking.id} booking={booking} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed p-6 text-center">
                <div>
                  <p className="text-sm font-medium">No bookings</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select another day to review its bookings.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Bookings;
