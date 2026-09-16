"use client";

import { useMemo } from "react";
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

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

function renderBookingMonthCell({ day, segments, isToday, isOutside }) {
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
      ].slice(0, 3)
    : [];
  const hiddenStatusTotal = visibleStatuses
    .filter((status) => !displayStatuses.includes(status))
    .reduce((sum, status) => sum + statusCounts[status], 0);

  return (
    <div className="flex h-full min-h-0 flex-col px-2 py-1.5">
      {bookings.length > 0 && (
        <div className="mt-auto min-w-0 space-y-1">
          {displayStatuses.map((status) => (
            <div
              key={status}
              className={`flex min-w-0 items-center gap-1.5 border-l-2 pl-1.5 text-[10px] leading-4 ${statusBorders[status]}`}
            >
              <span className="min-w-0 flex-1 truncate font-medium capitalize text-foreground">
                {statusLabels[status]}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                {statusCounts[status]}
              </span>
            </div>
          ))}
          {hiddenStatusTotal > 0 && (
            <div className="pl-2 text-[10px] font-medium leading-4 text-muted-foreground">
              +{hiddenStatusTotal} other
            </div>
          )}
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="truncate text-[9px] font-medium text-muted-foreground">
          {bookings.length > 0 ? `${bookings.length} total` : ""}
        </span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs ${
            isToday
              ? "bg-primary text-primary-foreground"
              : isOutside
                ? "text-muted-foreground"
                : ""
          }`}
        >
          {format(day, "d")}
        </span>
      </div>
    </div>
  );
}

function Bookings() {
  const events = useMemo(() => buildBookingEvents(new Date()), []);

  return (
    <div className="w-full p-4">
      <Card className="w-full py-0">
        <CardContent className="p-0">
          <EventCalendar
            defaultEvents={events}
            defaultView="month"
            resources={BOOKING_STREAMS}
            renderEvent={renderBookingEvent}
            renderEventTooltip={renderBookingTooltip}
            renderMoreIndicator={renderMoreIndicator}
            renderMonthCell={renderBookingMonthCell}
            interactions={{ drag: false, resize: false, selectSlot: false }}
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
    </div>
  );
}

export default Bookings;
