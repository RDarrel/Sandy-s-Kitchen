import { useMemo, useState } from "react";
import { EventCalendar } from "@/components/reui/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content";
import {
  EventCalendarNav,
  EventCalendarNavNext,
  EventCalendarNavPrev,
  EventCalendarNavToday,
  EventCalendarTitle,
} from "@/components/reui/event-calendar/event-calendar-nav";
import {
  addDays,
  addMinutes,
  format,
  setHours,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { CalendarCheck, MapPin, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Schedule from "./schedule";

const BOOKING_STREAMS = [
  {
    id: "catering",
    title: "Catering",
    color: "var(--color-rose-500)",
  },
  {
    id: "venue",
    title: "Venue",
    color: "var(--color-amber-500)",
  },
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
  completed: "completed",
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

const confirmedStatuses = ["approved", "setup", "completed"];

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

const moneyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

function buildBookingEvents(anchor) {
  const week = startOfWeek(startOfDay(anchor), {
    weekStartsOn: 0,
  });

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
        amount: 52000,
        received: 25000,
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
        amount: 18000,
        received: 0,
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
        amount: 18500,
        received: 18500,
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
        amount: 36000,
        received: 15000,
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
        amount: 5000,
        received: 0,
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
        amount: 12000,
        received: 12000,
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
        amount: 28000,
        received: 0,
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
        amount: 22000,
        received: 22000,
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
          {statusLabels[meta.status]}
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
              : `${format(event.start, "h:mm a")} - ${format(
                  event.end,
                  "h:mm a",
                )}`}
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Service</span>

          <span className="font-medium">{meta.service}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Venue</span>

          <span className="text-right font-medium">{meta.venue}</span>
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

  const hasBookings = bookings.length > 0;

  return (
    <div
      className={`relative h-full min-h-0 transition-colors ${
        hasBookings ? "bg-muted/20" : ""
      } ${isSelected ? "bg-muted/35 ring-1 ring-primary/25" : ""}`}
    >
      <div className="pointer-events-none absolute left-2 right-2 top-1.5 z-10 flex min-h-5 items-center justify-between gap-2">
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
        <div className="absolute inset-x-2 bottom-2 top-7 flex min-h-0 items-center">
          <div className="w-full min-w-0 space-y-0.5">
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
        </div>
      )}
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
  const [bookingSearch, setBookingSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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
      {
        all: selectedBookings.length,
      },
    );
  }, [selectedBookings]);

  const bookingSearchResults = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();

    if (!query) return [];

    return events
      .filter((event) => {
        const meta = event.meta || {};
        const searchable = [
          event.title,
          meta.customer,
          meta.venue,
          meta.service,
          meta.status,
          meta.payment,
          meta.contact,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 6);
  }, [bookingSearch, events]);

  const handleSearchResultClick = (booking) => {
    setSelectedDate(booking.start);
    setStatusFilter(booking.meta?.status || "all");
    setSearchOpen(false);
  };

  const monthlySummary = useMemo(() => {
    const monthKey = format(selectedDate, "yyyy-MM");

    const monthBookings = events.filter(
      (event) => format(event.start, "yyyy-MM") === monthKey,
    );

    const statusCountsForMonth = monthBookings.reduce(
      (counts, booking) => ({
        ...counts,
        [booking.meta.status]: (counts[booking.meta.status] || 0) + 1,
      }),
      {},
    );

    const confirmedBookings = monthBookings.filter((booking) =>
      confirmedStatuses.includes(booking.meta.status),
    );

    const confirmed = confirmedBookings.reduce(
      (total, booking) => total + Number(booking.meta.amount || 0),
      0,
    );

    const received = confirmedBookings.reduce(
      (total, booking) => total + Number(booking.meta.received || 0),
      0,
    );

    const toCollect = Math.max(confirmed - received, 0);

    return {
      label: format(selectedDate, "MMMM yyyy"),
      total: monthBookings.length,
      confirmed,
      received,
      toCollect,
      statuses: statusCountsForMonth,
    };
  }, [events, selectedDate]);

  return (
    <div className="w-full p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Calendar */}
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
                renderBookingMonthCell({
                  ...props,
                  selectedDay: selectedDate,
                })
              }
              interactions={{
                drag: false,
                resize: false,
                selectSlot: false,
              }}
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
              className="h-[660px] w-full"
              classNames={{
                monthDayHeader: "text-center",
                monthCell: "cursor-pointer hover:bg-muted/40 transition-colors",
                monthCellContent: "gap-1",
                moreIndicator: "mt-0.5 px-1",
              }}
            >
              {/* Calendar header */}
              <div className="relative z-50 border-b bg-muted/10 px-2 pb-2 sm:px-3">
                <EventCalendarNav className="flex min-w-0 flex-col items-stretch gap-2 py-2 sm:min-h-11 sm:flex-row sm:items-center sm:justify-between sm:py-0 xl:flex-nowrap xl:gap-3">
                  <div className="relative min-h-8 min-w-0 flex-1">
                    {/* Calendar navigation */}
                    <div
                      className={`absolute inset-y-0 left-0 flex min-w-0 origin-left items-center gap-1.5 transition-all duration-200 ease-out sm:gap-2 ${
                        searchOpen
                          ? "pointer-events-none -translate-x-2 scale-[0.98] opacity-0"
                          : "translate-x-0 scale-100 opacity-100"
                      }`}
                    >
                      <EventCalendarNavToday className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" />

                      <div className="mx-0.5 h-5 w-px shrink-0 bg-border" />

                      <div className="flex min-w-0 items-center rounded-md border bg-background px-0.5 shadow-xs">
                        <EventCalendarNavPrev />

                        <EventCalendarTitle className="min-w-24 px-1 text-center text-sm font-semibold text-foreground sm:min-w-32" />

                        <EventCalendarNavNext />
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Search bookings"
                          >
                            <Search className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Search bookings
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Global booking search */}
                    <div
                      className={`absolute inset-y-0 left-0 z-10 flex w-full max-w-xl origin-left items-center transition-all duration-200 ease-out ${
                        searchOpen
                          ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
                          : "pointer-events-none translate-x-2 scale-[0.98] opacity-0"
                      }`}
                    >
                      <div className="flex w-full items-center gap-1.5">
                        <div className="relative min-w-0 flex-1">
                          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="search"
                            value={bookingSearch}
                            onChange={(event) =>
                              setBookingSearch(event.target.value)
                            }
                            placeholder="Search by name, mobile, or email..."
                            className="h-8 bg-background/95 pl-8 pr-3 text-xs"
                          />

                          {bookingSearch.trim() && (
                            <div className="absolute left-0 right-0 top-full z-[80] mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
                              {bookingSearchResults.length > 0 ? (
                                <div>
                                  <div className="flex items-center justify-between gap-3 border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    <span>Search results</span>
                                    <span className="normal-case tracking-normal">
                                      {bookingSearchResults.length} bookings
                                    </span>
                                  </div>
                                  <div className="max-h-72 divide-y overflow-y-auto">
                                    {bookingSearchResults.map((booking) => (
                                      <button
                                        key={booking.id}
                                        type="button"
                                        onClick={() =>
                                          handleSearchResultClick(booking)
                                        }
                                        className="flex w-full min-w-0 items-start gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                                      >
                                        <span
                                          aria-hidden
                                          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${statusDots[booking.meta.status]}`}
                                        />
                                        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-3">
                                          <span className="block min-w-0">
                                            <span className="block min-w-0">
                                              <span className="truncate text-[13px] font-medium leading-4 text-foreground">
                                                {booking.meta.customer}
                                              </span>
                                            </span>
                                          </span>
                                          <span className="text-right text-[11px] text-muted-foreground">
                                            {format(
                                              booking.start,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                          <span className="mt-0.5 min-w-0 truncate text-[11px] text-muted-foreground">
                                            {booking.title}
                                          </span>
                                          <span className="mt-0.5 flex min-w-0 shrink-0 items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
                                            <span className="max-w-28 truncate">
                                              {booking.meta.service}
                                            </span>
                                          </span>
                                          <span className="hidden">
                                            <span className="truncate">
                                              {booking.meta.customer}
                                            </span>
                                            <span className="shrink-0">
                                              {format(
                                                booking.start,
                                                "MMM d, h:mm a",
                                              )}
                                            </span>
                                          </span>
                                          <span className="hidden">
                                            {booking.meta.customer} ·{" "}
                                            {format(
                                              booking.start,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                          <span className="hidden">
                                            {booking.meta.venue} ·{" "}
                                            {booking.meta.service}
                                          </span>
                                          <span className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <span className="flex min-w-0 items-center gap-1.5">
                                              <MapPin className="size-3 shrink-0" />
                                              <span className="truncate">
                                                {booking.meta.venue}
                                              </span>
                                            </span>
                                          </span>
                                          <span className="mt-1 flex justify-end">
                                            <span className="inline-flex items-center rounded-sm border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium capitalize leading-none text-muted-foreground">
                                              {
                                                statusLabels[
                                                  booking.meta.status
                                                ]
                                              }
                                            </span>
                                          </span>
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                                  No bookings found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => {
                                setSearchOpen(false);
                                setBookingSearch("");
                              }}
                              aria-label="Close search"
                            >
                              <X className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Close search
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Financial overview */}
                  <div className="flex w-full shrink-0 items-center gap-2 rounded-md border bg-background/70 px-2 py-1.5 sm:w-auto sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0">
                    <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
                      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        Confirmed
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                        {moneyFormatter.format(monthlySummary.confirmed)}
                      </p>
                    </div>

                    <div className="h-7 w-px shrink-0 bg-border/80" />

                    <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
                      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        Received
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                        {moneyFormatter.format(monthlySummary.received)}
                      </p>
                    </div>

                    <div className="h-7 w-px shrink-0 bg-border/80" />

                    <div className="min-w-0 flex-1 text-center sm:min-w-20 sm:flex-none sm:text-right">
                      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                        To Collect
                      </p>
                      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                        {moneyFormatter.format(monthlySummary.toCollect)}
                      </p>
                    </div>
                  </div>
                </EventCalendarNav>

                {/* Monthly booking overview */}
                <div className="flex min-h-8 min-w-0 flex-col gap-2 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex shrink-0 items-center gap-1.5">
                    <CalendarCheck className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Total bookings
                    </span>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-semibold leading-none tabular-nums text-foreground">
                      {monthlySummary.total}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center justify-start gap-x-3 gap-y-1 sm:justify-end">
                    {statusOrder
                      .filter((status) => monthlySummary.statuses[status])
                      .map((status) => (
                        <div
                          key={status}
                          className="inline-flex items-center gap-1.5"
                        >
                          <span
                            aria-hidden
                            className={`size-1.5 rounded-full ${statusDots[status]}`}
                          />

                          <span className="text-xs capitalize text-muted-foreground">
                            {statusLabels[status]}
                          </span>

                          <span className="text-xs font-semibold tabular-nums text-foreground">
                            {monthlySummary.statuses[status]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <EventCalendarContent />
            </EventCalendar>
          </CardContent>
        </Card>

        {/* Selected date bookings */}
        <Schedule
          selectedBookings={selectedBookings}
          selectedDate={selectDate}
          selectedStatusCounts={selectedStatusCounts}
          selectedBookingsByStatus={selectedBookingsByStatus}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>
    </div>
  );
}

export default Bookings;
