import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MY_BOOKINGS } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Search,
  Utensils,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

/*
 * Upcoming intentionally excludes pending.
 *
 * Pending has its own filter so customers can easily separate
 * bookings that are still waiting for approval from bookings
 * that are already moving forward.
 */
const upcomingStatuses = ["approved", "confirmed", "setup"];

const statusMeta = {
  pending: {
    label: "Pending",
    icon: Clock3,
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
  },

  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badgeClassName: "border-teal-200 bg-teal-50 text-teal-700",
  },

  setup: {
    label: "Preparing",
    icon: Clock3,
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
  },
};

/* -------------------------------------------------------------------------- */
/*                                PREVIEW DATA                                */
/* -------------------------------------------------------------------------- */

const previewBookings = [
  {
    _id: "preview-1",
    reference: "SK-2026-0001",

    eventType: "Birthday Celebration",
    bookingType: "both",
    status: "approved",

    date: "2026-10-12T00:00:00.000Z",
    createdAt: "2026-09-18T08:20:00.000Z",

    catering: {
      pax: 50,

      time: {
        start: "11:00",
        end: "15:00",
      },

      item: {
        name: "Classic Filipino Buffet",
      },
    },

    venue: {
      pax: 80,

      time: {
        start: "10:00",
        end: "16:00",
      },

      item: {
        name: "Sandy's Garden Hall",
        address: "Garden Hall, Main Branch",
      },
    },

    pricing: {
      total: 68000,
    },

    payment: {
      amount: 0,
      status: "unpaid",

      /*
       * Temporary preview value.
       *
       * Later, this should come from your backend/business rule.
       */
      downPayment: 20000,
    },
  },

  {
    _id: "preview-2",
    reference: "SK-2026-0002",

    eventType: "Wedding Reception",
    bookingType: "venue",
    status: "pending",

    date: "2026-11-04T00:00:00.000Z",
    createdAt: "2026-09-19T10:10:00.000Z",

    venue: {
      pax: 120,

      time: {
        start: "17:00",
        end: "22:00",
      },

      item: {
        name: "Grand Pavilion",
        address: "Rooftop Pavilion",
      },
    },

    pricing: {
      total: 85000,
    },

    payment: {
      amount: 0,
      status: "unpaid",
      downPayment: 25000,
    },
  },

  {
    _id: "preview-3",
    reference: "SK-2026-0003",

    eventType: "Corporate Lunch",
    bookingType: "catering",
    status: "confirmed",

    date: "2026-09-28T00:00:00.000Z",
    createdAt: "2026-08-10T09:00:00.000Z",

    catering: {
      pax: 45,

      time: {
        start: "12:00",
        end: "14:00",
      },

      venue: {
        location: "Makati Office Pantry",
      },

      item: {
        name: "Executive Lunch Package",
      },
    },

    pricing: {
      total: 22500,
    },

    payment: {
      amount: 10000,
      status: "partial",
      downPayment: 10000,
    },
  },

  {
    _id: "preview-4",
    reference: "SK-2026-0004",

    eventType: "Christening",
    bookingType: "both",
    status: "setup",

    date: "2026-09-22T00:00:00.000Z",
    createdAt: "2026-06-22T13:40:00.000Z",

    catering: {
      pax: 60,

      time: {
        start: "09:00",
        end: "12:00",
      },

      item: {
        name: "Family Feast Package",
      },
    },

    venue: {
      pax: 80,

      time: {
        start: "08:00",
        end: "13:00",
      },

      item: {
        name: "Private Dining Room",
        address: "Second Floor Hall",
      },
    },

    pricing: {
      total: 39000,
    },

    payment: {
      amount: 20000,
      status: "partial",
      downPayment: 15000,
    },
  },

  {
    _id: "preview-5",
    reference: "SK-2026-0005",

    eventType: "Graduation Dinner",
    bookingType: "catering",
    status: "completed",

    date: "2026-06-02T00:00:00.000Z",
    createdAt: "2026-05-18T16:15:00.000Z",

    catering: {
      pax: 35,

      time: {
        start: "18:00",
        end: "21:00",
      },

      venue: {
        address: "Customer Residence, Quezon City",
      },

      item: {
        name: "Premium Dinner Tray Set",
      },
    },

    pricing: {
      total: 18500,
    },

    payment: {
      amount: 18500,
      status: "paid",
      downPayment: 5000,
    },
  },

  {
    _id: "preview-6",
    reference: "SK-2026-0006",

    eventType: "Family Reunion",
    bookingType: "both",
    status: "cancelled",

    date: "2026-05-14T00:00:00.000Z",
    createdAt: "2026-04-30T11:25:00.000Z",

    catering: {
      pax: 90,

      time: {
        start: "10:30",
        end: "14:30",
      },

      item: {
        name: "Fiesta Buffet Package",
      },
    },

    venue: {
      pax: 100,

      time: {
        start: "09:30",
        end: "15:30",
      },

      item: {
        name: "Main Function Room",
        address: "Main Branch Hall",
      },
    },

    pricing: {
      total: 72000,
    },

    payment: {
      amount: 15000,
      status: "refunded",
      downPayment: 15000,
    },
  },

  {
    _id: "preview-7",
    reference: "SK-2026-0007",

    eventType: "Product Launch",
    bookingType: "venue",
    status: "approved",

    date: "2026-12-08T00:00:00.000Z",
    createdAt: "2026-09-20T15:45:00.000Z",

    venue: {
      pax: 65,

      time: {
        start: "13:00",
        end: "18:00",
      },

      item: {
        name: "Studio Hall",
        address: "Events Wing, Third Floor",
      },
    },

    pricing: {
      total: 46000,
    },

    payment: {
      amount: 23000,
      status: "partial",
      downPayment: 15000,
    },
  },

  {
    _id: "preview-8",
    reference: "SK-2026-0008",

    eventType: "Team Breakfast",
    bookingType: "catering",
    status: "pending",

    date: "2026-10-03T00:00:00.000Z",
    createdAt: "2026-09-21T07:30:00.000Z",

    catering: {
      pax: 25,

      time: {
        start: "07:00",
        end: "09:00",
      },

      venue: {
        address: "BGC Office Boardroom",
      },

      item: {
        name: "Breakfast Tray Package",
      },
    },

    pricing: {
      total: 12500,
    },

    payment: {
      amount: 0,
      status: "unpaid",
      downPayment: 5000,
    },
  },

  {
    _id: "preview-9",
    reference: "SK-2026-0009",

    eventType: "Anniversary Dinner",
    bookingType: "both",
    status: "confirmed",

    date: "2026-10-26T00:00:00.000Z",
    createdAt: "2026-09-12T18:05:00.000Z",

    catering: {
      pax: 40,

      time: {
        start: "18:00",
        end: "21:30",
      },

      item: {
        name: "Premium Dinner Buffet",
      },
    },

    venue: {
      pax: 45,

      time: {
        start: "17:00",
        end: "22:00",
      },

      item: {
        name: "Private Dining Hall",
        address: "Second Floor Hall",
      },
    },

    pricing: {
      total: 54000,
    },

    payment: {
      amount: 54000,
      status: "paid",
      downPayment: 15000,
    },
  },

  /*
   * Extra preview data so you can see how a completed
   * booking with a remaining balance will look.
   */
  {
    _id: "preview-10",
    reference: "SK-2026-0010",

    eventType: "Private Dinner",
    bookingType: "catering",
    status: "completed",

    date: "2026-08-15T00:00:00.000Z",
    createdAt: "2026-07-28T08:00:00.000Z",

    catering: {
      pax: 30,

      time: {
        start: "18:00",
        end: "21:00",
      },

      venue: {
        address: "Customer Residence, Nueva Ecija",
      },

      item: {
        name: "Premium Dinner Package",
      },
    },

    pricing: {
      total: 30000,
    },

    payment: {
      amount: 25000,
      status: "partial",
      downPayment: 10000,
    },
  },
  {
    _id: "preview-11",
    reference: "SK-2026-0011",

    eventType: "Birthday Party",
    bookingType: "both",
    status: "pending",

    // Newly submitted booking
    date: "2026-10-18T00:00:00.000Z",
    createdAt: "2026-09-22T02:45:00.000Z",

    catering: {
      pax: 50,

      time: {
        start: "11:00",
        end: "15:00",
      },

      item: {
        name: "Classic Filipino Buffet",
      },
    },

    venue: {
      pax: 50,

      time: {
        start: "10:00",
        end: "16:00",
      },

      item: {
        name: "Sandy's Garden Hall",
        address: "Garden Hall, Main Branch",
      },
    },

    pricing: {
      total: 45000,
    },

    payment: {
      amount: 0,
      status: "unpaid",
      downPayment: 15000,
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

const MyBookings = () => {
  const { collections = [], isLoadingMyBookingss } = useSelector(
    ({ bookings }) => bookings,
  );
  const isLoadingMyBookings = false;
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    dispatch(MY_BOOKINGS());
  }, [dispatch]);

  const bookings = useMemo(() => {
    /*
     * Preview only.
     *
     * Replace this:
     *
     * const data = previewBookings;
     *
     * with:
     *
     * const data = collections;
     *
     * once your API data is ready.
     */
    const data = previewBookings;

    return [...data].sort((first, second) => {
      const firstStatus = getStatusKey(first);
      const secondStatus = getStatusKey(second);

      const firstActive =
        firstStatus === "pending" || upcomingStatuses.includes(firstStatus);

      const secondActive =
        secondStatus === "pending" || upcomingStatuses.includes(secondStatus);

      if (firstActive && !secondActive) {
        return -1;
      }

      if (!firstActive && secondActive) {
        return 1;
      }

      const firstDate = new Date(first?.date || first?.createdAt || 0);
      const secondDate = new Date(second?.date || second?.createdAt || 0);

      /*
       * Active bookings:
       * nearest event first.
       */
      if (firstActive && secondActive) {
        return firstDate - secondDate;
      }

      /*
       * Completed / cancelled:
       * latest event first.
       */
      return secondDate - firstDate;
    });
  }, [collections]);

  const counts = useMemo(() => {
    return bookings.reduce(
      (summary, booking) => {
        const status = getStatusKey(booking);

        summary.all += 1;

        if (upcomingStatuses.includes(status)) {
          summary.upcoming += 1;
        }

        if (status === "pending") {
          summary.pending += 1;
        }

        if (status === "completed") {
          summary.completed += 1;
        }

        if (status === "cancelled") {
          summary.cancelled += 1;
        }

        return summary;
      },
      {
        all: 0,
        upcoming: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
      },
    );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = getStatusKey(booking);

      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && upcomingStatuses.includes(status)) ||
        (filter === "pending" && status === "pending") ||
        (filter === "completed" && status === "completed") ||
        (filter === "cancelled" && status === "cancelled");

      const matchesSearch =
        !search ||
        [
          booking?.reference,
          booking?._id,
          booking?.eventType,
          booking?.bookingType,
          booking?.status,
          booking?.catering?.item?.name,
          booking?.venue?.item?.name,
          booking?.venue?.item?.address,
          booking?.catering?.venue?.location,
          booking?.catering?.venue?.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, query]);

  return (
    <main className="mx-auto w-full max-w-6xl p-3 md:p-5">
      <section className="grid gap-3">
        <header className="overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* Compact heading */}
          <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />

                <h1 className="text-lg font-semibold leading-tight tracking-tight">
                  My Bookings
                </h1>
              </div>

              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Track your reservations, booking status, and payments.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reference or booking..."
                className="h-8 bg-muted/20 pl-8 text-xs shadow-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="border-t px-2 py-1.5">
            <BookingFilters
              value={filter}
              counts={counts}
              onChange={setFilter}
            />
          </div>
        </header>

        {isLoadingMyBookings ? (
          <LoadingList />
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : filteredBookings.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid gap-2">
            {filteredBookings.map((booking) => (
              <BookingTicket key={getBookingId(booking)} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MyBookings;

/* -------------------------------------------------------------------------- */
/*                                  FILTERS                                   */
/* -------------------------------------------------------------------------- */

const BookingFilters = ({ value, counts, onChange }) => {
  const filters = [
    {
      value: "upcoming",
      label: "Upcoming",
      count: counts.upcoming,
    },
    {
      value: "pending",
      label: "Pending",
      count: counts.pending,
    },
    {
      value: "completed",
      label: "Completed",
      count: counts.completed,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: counts.cancelled,
    },
    {
      value: "all",
      label: "All",
      count: counts.all,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Booking categories"
      className="flex min-w-0 gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {filters.map((item) => {
        const isActive = value === item.value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition sm:gap-2 sm:px-3 sm:text-xs ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            {item.label}

            <span
              className={`inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-4 sm:min-w-[18px] sm:px-1.5 sm:text-[10px] ${
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {item.count || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               BOOKING TICKET                               */
/* -------------------------------------------------------------------------- */

const BookingTicket = ({ booking }) => {
  const status = getStatusMeta(booking);
  const services = getServices(booking);
  const payment = getPaymentSummary(booking);
  const date = getDateParts(booking?.date);

  const action = getBookingAction(booking, payment);

  const StatusIcon = status.icon;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_11rem]">
        {/* Mobile layout */}
        <div className="p-2.5 md:hidden">
          {/* Date + booking header */}
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30">
              <span className="text-[9px] font-semibold uppercase leading-3 text-muted-foreground">
                {date.month}
              </span>
              <span className="text-sm font-semibold leading-4">
                {date.day}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold leading-4">
                    {booking?.eventType || "Event booking"}
                  </h2>

                  <div className="mt-0.5 flex min-w-0 items-center gap-1 text-[9px] text-muted-foreground">
                    <span className="shrink-0 font-semibold uppercase tracking-wide">
                      Booking
                    </span>
                    <span>•</span>
                    <span className="truncate font-mono font-semibold text-foreground">
                      {booking?.reference || "Reference unavailable"}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex h-5 w-fit shrink-0 items-center gap-1 rounded-md border px-1.5 text-[9px] font-semibold ${status.badgeClassName}`}
                >
                  <StatusIcon className="size-3" />
                  {status.label}
                </span>
              </div>

              <p className="mt-1 text-[9px] leading-3 text-muted-foreground">
                <span className="font-medium text-foreground">
                  {date.weekday}
                </span>
                <span className="mx-1">•</span>
                {date.year}
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="mt-2 grid gap-1.5">
            {services.map((service) => (
              <ServiceDetail key={service.type} service={service} />
            ))}
          </div>

          <BookingAction action={action} />
        </div>

        {/* Tablet / desktop layout - preserved original design */}
        <div className="hidden gap-3 p-3 md:grid md:grid-cols-[4.25rem_minmax(0,1fr)]">
          {/* Date */}
          <div className="block">
            <div className="mx-auto flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {date.month}
              </span>

              <span className="text-base font-semibold leading-none">
                {date.day}
              </span>
            </div>

            <div className="mt-1 min-w-0 text-center">
              <p className="text-xs font-semibold text-foreground">
                {date.weekday}
              </p>
              <p className="text-[11px] text-muted-foreground">{date.year}</p>
            </div>
          </div>

          {/* Booking */}
          <div className="min-w-0">
            {/* Header */}
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold leading-5">
                  {booking?.eventType || "Event booking"}
                </h2>

                <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Booking
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="truncate font-mono text-[11px] font-semibold text-foreground">
                    {booking?.reference || "Reference unavailable"}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold ${status.badgeClassName}`}
              >
                <StatusIcon className="size-3.5" />
                {status.label}
              </span>
            </div>

            {/* Catering / Venue */}
            <div
              className={`mt-2 grid gap-1.5 ${
                services.length > 1 ? "lg:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {services.map((service) => (
                <ServiceDetail key={service.type} service={service} />
              ))}
            </div>

            {/* Payment / booking message */}
            <BookingAction action={action} />
          </div>
        </div>

        <FinancialSummary payment={payment} />
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/*                              SERVICE DETAIL                                */
/* -------------------------------------------------------------------------- */

const ServiceDetail = ({ service }) => {
  const isVenue = service.type === "venue";
  const Icon = isVenue ? Building2 : Utensils;

  return (
    <div className="min-w-0 rounded-md border bg-muted/10 px-2 py-1.5">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-background">
          <Icon className="size-3.5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {isVenue ? "Venue" : "Catering"}
            </span>

            <span className="truncate text-xs font-semibold">
              {service.name}
            </span>
          </div>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{service.time}</span>

            <span>•</span>

            <span>{service.pax} pax</span>

            {service.location && service.location !== "-" && (
              <>
                <span>•</span>

                <span className="flex min-w-0 items-center gap-0.5">
                  <MapPin className="size-3 shrink-0" />

                  <span className="max-w-40 truncate">{service.location}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              BOOKING ACTION                                */
/* -------------------------------------------------------------------------- */

const BookingAction = ({ action }) => {
  const Icon = action.icon;

  return (
    <div
      className={`mt-1.5 flex min-w-0 flex-col gap-1.5 rounded-md border px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between ${
        action.variant === "payment"
          ? "border-amber-200 bg-amber-50/60"
          : action.variant === "success"
            ? "border-emerald-200 bg-emerald-50/50"
            : action.variant === "danger"
              ? "border-red-200 bg-red-50/50"
              : action.variant === "preparing"
                ? "border-violet-200 bg-violet-50/50"
                : "border-border bg-muted/10"
      }`}
    >
      <div className="flex min-w-0 items-start gap-1.5 sm:items-center">
        <Icon
          className={`mt-0.5 size-3 shrink-0 sm:mt-0 sm:size-3.5 ${
            action.variant === "payment"
              ? "text-amber-700"
              : action.variant === "success"
                ? "text-emerald-700"
                : action.variant === "danger"
                  ? "text-red-700"
                  : action.variant === "preparing"
                    ? "text-violet-700"
                    : "text-muted-foreground"
          }`}
        />

        <p
          className={`text-[11px] leading-4 sm:text-xs ${
            action.variant === "payment"
              ? "font-medium text-amber-800"
              : action.variant === "success"
                ? "font-medium text-emerald-800"
                : action.variant === "danger"
                  ? "font-medium text-red-700"
                  : action.variant === "preparing"
                    ? "font-medium text-violet-700"
                    : "text-muted-foreground"
          }`}
        >
          {action.message}
        </p>
      </div>

      {action.buttonLabel && (
        <Button
          type="button"
          size="sm"
          className="h-6 w-full shrink-0 gap-1 px-2 text-[9px] sm:w-auto sm:text-[10px]"
        >
          {action.buttonLabel}

          <ArrowRight className="size-3" />
        </Button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           FINANCIAL SUMMARY                                */
/* -------------------------------------------------------------------------- */

const FinancialSummary = ({ payment }) => {
  const isFullyPaid = payment.balance <= 0;

  return (
    <>
      {/* Mobile compact footer */}
      <div className="border-t bg-muted/10 px-2.5 py-2 xl:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            <CompactAmountBlock
              label="Total"
              value={Formatter.amount(payment.total)}
            />

            <CompactAmountBlock
              label="Balance"
              value={isFullyPaid ? "Paid" : Formatter.amount(payment.balance)}
              valueClassName={
                isFullyPaid ? "text-emerald-700" : "text-amber-700"
              }
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2.5 text-[10px] sm:text-xs"
          >
            <span className="hidden sm:inline">View details</span>
            <span className="sm:hidden">Details</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Desktop financial sidebar */}
      <div className="hidden flex-col border-l bg-muted/10 p-3 xl:flex">
        <div className="grid grid-cols-1 gap-3">
          <AmountBlock label="Total" value={Formatter.amount(payment.total)} />

          <AmountBlock
            label="Balance"
            value={isFullyPaid ? "Paid" : Formatter.amount(payment.balance)}
            valueClassName={isFullyPaid ? "text-emerald-700" : "text-amber-700"}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 w-full justify-between text-xs"
        >
          View details
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </>
  );
};

const CompactAmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-0.5 truncate text-xs font-semibold leading-4 ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                AMOUNT BLOCK                                */
/* -------------------------------------------------------------------------- */

const AmountBlock = ({ label, value, valueClassName = "" }) => {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className={`mt-0.5 text-sm font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  LOADING                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                  LOADING                                   */
/* -------------------------------------------------------------------------- */

const LoadingList = () => {
  return (
    <div className="grid gap-2">
      {[1, 2, 3].map((item) => (
        <BookingTicketSkeleton key={item} />
      ))}
    </div>
  );
};

const BookingTicketSkeleton = () => {
  return (
    <article className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_11rem]">
        {/* --------------------------------------------------------------- */}
        {/* Mobile layout                                                   */}
        {/* --------------------------------------------------------------- */}
        <div className="p-2.5 md:hidden">
          {/* Date + booking header */}
          <div className="flex min-w-0 items-start gap-2.5">
            {/* Date */}
            <Skeleton className="h-11 w-12 shrink-0 rounded-md" />

            {/* Booking information */}
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {/* Event title */}
                  <Skeleton className="h-4 w-28 rounded" />

                  {/* Booking reference */}
                  <div className="mt-1 flex min-w-0 items-center gap-1">
                    <Skeleton className="h-2.5 w-10 rounded" />

                    <Skeleton className="size-1 shrink-0 rounded-full" />

                    <Skeleton className="h-2.5 w-20 rounded" />
                  </div>
                </div>

                {/* Status */}
                <Skeleton className="h-5 w-[4.5rem] shrink-0 rounded-md" />
              </div>

              {/* Weekday + year */}
              <div className="mt-1.5 flex items-center gap-1">
                <Skeleton className="h-2.5 w-6 rounded" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-2.5 w-8 rounded" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mt-2 grid gap-1.5">
            <ServiceDetailSkeleton />
            <ServiceDetailSkeleton />
          </div>

          {/* Booking action */}
          <BookingActionSkeleton />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Tablet / desktop layout                                         */}
        {/* --------------------------------------------------------------- */}
        <div className="hidden gap-3 p-3 md:grid md:grid-cols-[4.25rem_minmax(0,1fr)]">
          {/* Date */}
          <div className="block">
            <Skeleton className="mx-auto h-12 w-14 rounded-md" />

            <div className="mt-1 flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-7 rounded" />
              <Skeleton className="h-2.5 w-8 rounded" />
            </div>
          </div>

          {/* Booking */}
          <div className="min-w-0">
            {/* Header */}
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                {/* Event title */}
                <Skeleton className="h-5 w-36 rounded" />

                {/* Booking reference */}
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <Skeleton className="h-2.5 w-11 rounded" />

                  <Skeleton className="size-1 shrink-0 rounded-full" />

                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>

              {/* Status */}
              <Skeleton className="h-6 w-20 shrink-0 rounded-md" />
            </div>

            {/* Catering / Venue */}
            <div className="mt-2 grid gap-1.5 lg:grid-cols-2">
              <ServiceDetailSkeleton />
              <ServiceDetailSkeleton />
            </div>

            {/* Payment / booking message */}
            <BookingActionSkeleton />
          </div>
        </div>

        {/* Financial summary */}
        <FinancialSummarySkeleton />
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/*                          SERVICE DETAIL SKELETON                           */
/* -------------------------------------------------------------------------- */

const ServiceDetailSkeleton = () => {
  return (
    <div className="min-w-0 rounded-md border bg-muted/10 px-2 py-1.5">
      <div className="flex min-w-0 items-start gap-2">
        {/* Service icon */}
        <Skeleton className="size-6 shrink-0 rounded" />

        <div className="min-w-0 flex-1">
          {/* Type + service name */}
          <div className="flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-2.5 w-10 shrink-0 rounded" />

            <Skeleton className="h-3 w-28 max-w-[45%] rounded" />
          </div>

          {/* Time / pax / location */}
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <Skeleton className="h-2.5 w-[5.5rem] shrink-0 rounded" />

            <Skeleton className="size-1 shrink-0 rounded-full" />

            <Skeleton className="h-2.5 w-10 shrink-0 rounded" />

            <Skeleton className="size-1 shrink-0 rounded-full" />

            <Skeleton className="h-2.5 min-w-0 flex-1 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          BOOKING ACTION SKELETON                           */
/* -------------------------------------------------------------------------- */

const BookingActionSkeleton = () => {
  return (
    <div className="mt-1.5 flex min-w-0 flex-col gap-1.5 rounded-md border bg-muted/10 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Message */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <Skeleton className="size-3.5 shrink-0 rounded" />

        <Skeleton className="h-3 min-w-0 flex-1 rounded sm:max-w-[26rem]" />
      </div>

      {/* Action button */}
      <Skeleton className="h-6 w-full shrink-0 rounded-md sm:w-[5.5rem]" />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                        FINANCIAL SUMMARY SKELETON                          */
/* -------------------------------------------------------------------------- */

const FinancialSummarySkeleton = () => {
  return (
    <>
      {/* Mobile / tablet compact footer */}
      <div className="border-t bg-muted/10 px-2.5 py-2 xl:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {/* Total */}
            <div className="min-w-0">
              <Skeleton className="h-2 w-7 rounded" />
              <Skeleton className="mt-1 h-3.5 w-16 rounded" />
            </div>

            {/* Balance */}
            <div className="min-w-0">
              <Skeleton className="h-2 w-10 rounded" />
              <Skeleton className="mt-1 h-3.5 w-16 rounded" />
            </div>
          </div>

          {/* View details */}
          <Skeleton className="h-8 w-16 shrink-0 rounded-md sm:w-24" />
        </div>
      </div>

      {/* Desktop financial sidebar */}
      <div className="hidden flex-col border-l bg-muted/10 p-3 xl:flex">
        {/* Total */}
        <div>
          <Skeleton className="h-2.5 w-8 rounded" />
          <Skeleton className="mt-1.5 h-4 w-20 rounded" />
        </div>

        {/* Balance */}
        <div className="mt-3">
          <Skeleton className="h-2.5 w-12 rounded" />
          <Skeleton className="mt-1.5 h-4 w-16 rounded" />
        </div>

        {/* View details */}
        <Skeleton className="mt-3 h-8 w-full rounded-md" />
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                               EMPTY STATES                                 */
/* -------------------------------------------------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-lg border border-dashed bg-card px-4 py-14 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-md border bg-primary/5">
        <CalendarDays className="size-5 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-base font-semibold">No bookings yet</h2>

      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Your submitted catering and venue reservations will appear here.
      </p>
    </div>
  );
};

const NoResults = () => {
  return (
    <div className="rounded-lg border border-dashed bg-card px-4 py-12 text-center">
      <Search className="mx-auto size-5 text-muted-foreground" />

      <p className="mt-3 text-sm font-medium">No bookings found</p>

      <p className="mt-1 text-xs text-muted-foreground">
        Try another search or booking category.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

const getBookingId = (booking) => {
  return String(
    booking?._id ||
      booking?.reference ||
      booking?.id ||
      booking?.createdAt ||
      booking?.date,
  );
};

const getStatusKey = (booking) => {
  return String(booking?.status || "pending").toLowerCase();
};

const getStatusMeta = (booking) => {
  const key = getStatusKey(booking);

  return (
    statusMeta[key] || {
      label: capitalize(key),
      icon: Clock3,
      badgeClassName: "border-border bg-muted/30 text-foreground",
    }
  );
};

/* -------------------------------------------------------------------------- */
/*                                  SERVICES                                  */
/* -------------------------------------------------------------------------- */

const getServices = (booking) => {
  if (!booking) {
    return [];
  }

  const services = [];

  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    services.push({
      type: "catering",

      name: booking?.catering?.item?.name || "Catering package",

      pax: Number(booking?.catering?.pax || 0),

      time: formatTimeRange(booking?.catering?.time),

      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        (booking.bookingType === "catering"
          ? booking?.venue?.item?.address
          : null) ||
        "-",
    });
  }

  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    services.push({
      type: "venue",

      name: booking?.venue?.item?.name || "Venue reservation",

      pax: Number(booking?.venue?.pax || 0),

      time: formatTimeRange(booking?.venue?.time),

      location: booking?.venue?.item?.address || "-",
    });
  }

  return services;
};

/* -------------------------------------------------------------------------- */
/*                                  PAYMENT                                   */
/* -------------------------------------------------------------------------- */

const getPaymentSummary = (booking) => {
  const total = Number(booking?.pricing?.total || 0);

  /*
   * This assumes payment.amount represents the total amount
   * already received from the customer.
   */
  const received = Number(booking?.payment?.amount || 0);

  /*
   * Temporary based on your current preview structure.
   * Later this can come from your actual backend payment rules.
   */
  const downPayment = Number(booking?.payment?.downPayment || 0);

  return {
    total,
    received,
    downPayment,

    balance: Math.max(total - received, 0),
  };
};

/* -------------------------------------------------------------------------- */
/*                              BOOKING ACTION                                */
/* -------------------------------------------------------------------------- */

const getBookingAction = (booking, payment) => {
  const status = getStatusKey(booking);

  /*
   * PENDING
   *
   * The booking has been submitted but the admin has not
   * approved it yet.
   */
  if (status === "pending") {
    return {
      message:
        "Your booking is awaiting approval. We'll notify you once it has been reviewed.",
      buttonLabel: null,
      icon: Clock3,
      variant: "default",
    };
  }

  /*
   * APPROVED
   *
   * The booking was approved, but the required down payment
   * has not been fully paid yet.
   */
  if (
    status === "approved" &&
    payment.downPayment > 0 &&
    payment.received < payment.downPayment
  ) {
    const remainingDownPayment = payment.downPayment - payment.received;

    return {
      message: `Your booking has been approved. Pay ${Formatter.amount(
        remainingDownPayment,
      )} to confirm your reservation.`,
      buttonLabel: "Pay",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * APPROVED
   *
   * Required down payment is already satisfied,
   * but there is still a remaining balance.
   */
  if (status === "approved" && payment.balance > 0) {
    return {
      message: `Down payment received. Your booking is awaiting confirmation. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * APPROVED
   *
   * Customer has already fully paid.
   */
  if (status === "approved") {
    return {
      message: "Payment received. Your booking is awaiting confirmation.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * CONFIRMED
   *
   * Booking is already confirmed but customer still
   * has a remaining balance.
   */
  if (status === "confirmed" && payment.balance > 0) {
    return {
      message: `Your booking is confirmed. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * CONFIRMED
   *
   * Booking is confirmed and fully paid.
   */
  if (status === "confirmed") {
    return {
      message:
        "Your booking is confirmed and fully paid. No further payment is required.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * SETUP / PREPARING
   *
   * Event preparation has started but there is still
   * an outstanding balance.
   */
  if (status === "setup" && payment.balance > 0) {
    return {
      message: `We're preparing for your event. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * SETUP / PREPARING
   *
   * Event preparation has started and payment is complete.
   */
  if (status === "setup") {
    return {
      message: "We're preparing for your event. Your payment is complete.",
      buttonLabel: null,
      icon: Clock3,
      variant: "preparing",
    };
  }

  /*
   * COMPLETED
   *
   * Event is completed but there is still an outstanding
   * balance.
   */
  if (status === "completed" && payment.balance > 0) {
    return {
      message: `Your event has been completed. Remaining balance: ${Formatter.amount(
        payment.balance,
      )}.`,
      buttonLabel: "Pay balance",
      icon: CreditCard,
      variant: "payment",
    };
  }

  /*
   * COMPLETED
   *
   * Event is completed and fully paid.
   */
  if (status === "completed") {
    return {
      message:
        "Your event has been completed. Thank you for choosing Sandy's Kitchenette.",
      buttonLabel: null,
      icon: CheckCircle2,
      variant: "success",
    };
  }

  /*
   * CANCELLED
   *
   * Do not show a normal "Pay balance" action for a
   * cancelled booking even if pricing - received > 0.
   *
   * Refund/payment handling should be shown in the
   * booking details separately.
   */
  if (status === "cancelled") {
    return {
      message:
        "This booking has been cancelled. View the booking details for more information.",
      buttonLabel: null,
      icon: XCircle,
      variant: "danger",
    };
  }

  return {
    message: "View your booking for the latest update.",
    buttonLabel: null,
    icon: CalendarDays,
    variant: "default",
  };
};

/* -------------------------------------------------------------------------- */
/*                                DATE / TIME                                 */
/* -------------------------------------------------------------------------- */

const getDateParts = (date) => {
  if (!date) {
    return {
      month: "--",
      day: "--",
      weekday: "No date",
      year: "",
    };
  }

  const value = new Date(date);

  return {
    month: value.toLocaleString("en-US", {
      month: "short",
    }),

    day: value.toLocaleString("en-US", {
      day: "2-digit",
    }),

    weekday: value.toLocaleString("en-US", {
      weekday: "short",
    }),

    year: value.toLocaleString("en-US", {
      year: "numeric",
    }),
  };
};

const formatTimeRange = (time = {}) => {
  if (!time?.start && !time?.end) {
    return "-";
  }

  if (time?.start && !time?.end) {
    return Formatter.time(time.start);
  }

  if (!time?.start && time?.end) {
    return Formatter.time(time.end);
  }

  return `${Formatter.time(time.start)} - ${Formatter.time(time.end)}`;
};

const capitalize = (value) => {
  const text = String(value || "").trim();

  if (!text) {
    return "-";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};
