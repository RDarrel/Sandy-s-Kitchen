import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MY_BOOKINGS } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  MapPin,
  Search,
  Utensils,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const activeStatuses = ["pending", "approved", "confirmed", "setup"];
const pastStatuses = ["completed", "cancelled"];

const statusMeta = {
  pending: {
    label: "Pending",
    icon: Clock3,
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
    accentClassName: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accentClassName: "bg-emerald-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badgeClassName: "border-teal-200 bg-teal-50 text-teal-700",
    accentClassName: "bg-teal-500",
  },
  setup: {
    label: "SetUp",
    icon: Clock3,
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
    accentClassName: "bg-violet-500",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    accentClassName: "bg-sky-500",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badgeClassName: "border-red-200 bg-red-50 text-red-700",
    accentClassName: "bg-red-500",
  },
};

const typeMeta = {
  catering: { label: "Catering", icon: Utensils },
  venue: { label: "Venue", icon: Building2 },
  both: { label: "Catering + Venue", icon: CalendarDays },
};

const previewBookings = [
  {
    _id: "preview-1",
    eventType: "Birthday Celebration",
    bookingType: "both",
    status: "approved",
    date: "2026-10-12T00:00:00.000Z",
    createdAt: "2026-09-18T08:20:00.000Z",
    catering: {
      pax: 50,
      time: { start: "11:00", end: "15:00" },
      item: { name: "Classic Filipino Buffet" },
    },
    venue: {
      pax: 80,
      time: { start: "10:00", end: "16:00" },
      item: {
        name: "Sandy's Garden Hall",
        address: "Garden Hall, Main Branch",
      },
    },
    pricing: { total: 68000 },
    payment: { amount: 40000, status: "partial" },
  },
  {
    _id: "preview-2",
    eventType: "Wedding Reception",
    bookingType: "venue",
    status: "pending",
    date: "2026-11-04T00:00:00.000Z",
    createdAt: "2026-09-19T10:10:00.000Z",
    venue: {
      pax: 120,
      time: { start: "17:00", end: "22:00" },
      item: { name: "Grand Pavilion", address: "Rooftop Pavilion" },
    },
    pricing: { total: 85000 },
    payment: { amount: 0, status: "unpaid" },
  },
  {
    _id: "preview-3",
    eventType: "Corporate Lunch",
    bookingType: "catering",
    status: "confirmed",
    date: "2026-09-28T00:00:00.000Z",
    createdAt: "2026-08-10T09:00:00.000Z",
    catering: {
      pax: 45,
      time: { start: "12:00", end: "14:00" },
      venue: { location: "Makati Office Pantry" },
      item: { name: "Executive Lunch Package" },
    },
    pricing: { total: 22500 },
    payment: { amount: 22500, status: "paid" },
  },
  {
    _id: "preview-4",
    eventType: "Christening",
    bookingType: "both",
    status: "setup",
    date: "2026-09-22T00:00:00.000Z",
    createdAt: "2026-06-22T13:40:00.000Z",
    catering: {
      pax: 60,
      time: { start: "09:00", end: "12:00" },
      item: { name: "Family Feast Package" },
    },
    venue: {
      pax: 80,
      time: { start: "08:00", end: "13:00" },
      item: { name: "Private Dining Room", address: "Second Floor Hall" },
    },
    pricing: { total: 39000 },
    payment: { amount: 39000, status: "paid" },
  },
  {
    _id: "preview-5",
    eventType: "Graduation Dinner",
    bookingType: "catering",
    status: "completed",
    date: "2026-06-02T00:00:00.000Z",
    createdAt: "2026-05-18T16:15:00.000Z",
    catering: {
      pax: 35,
      time: { start: "18:00", end: "21:00" },
      venue: { address: "Customer Residence, Quezon City" },
      item: { name: "Premium Dinner Tray Set" },
    },
    pricing: { total: 18500 },
    payment: { amount: 18500, status: "paid" },
  },
  {
    _id: "preview-6",
    eventType: "Family Reunion",
    bookingType: "both",
    status: "cancelled",
    date: "2026-05-14T00:00:00.000Z",
    createdAt: "2026-04-30T11:25:00.000Z",
    catering: {
      pax: 90,
      time: { start: "10:30", end: "14:30" },
      item: { name: "Fiesta Buffet Package" },
    },
    venue: {
      pax: 100,
      time: { start: "09:30", end: "15:30" },
      item: { name: "Main Function Room", address: "Main Branch Hall" },
    },
    pricing: { total: 72000 },
    payment: { amount: 15000, status: "refunded" },
  },
  {
    _id: "preview-7",
    eventType: "Product Launch",
    bookingType: "venue",
    status: "approved",
    date: "2026-12-08T00:00:00.000Z",
    createdAt: "2026-09-20T15:45:00.000Z",
    venue: {
      pax: 65,
      time: { start: "13:00", end: "18:00" },
      item: { name: "Studio Hall", address: "Events Wing, Third Floor" },
    },
    pricing: { total: 46000 },
    payment: { amount: 23000, status: "partial" },
  },
  {
    _id: "preview-8",
    eventType: "Team Breakfast",
    bookingType: "catering",
    status: "pending",
    date: "2026-10-03T00:00:00.000Z",
    createdAt: "2026-09-21T07:30:00.000Z",
    catering: {
      pax: 25,
      time: { start: "07:00", end: "09:00" },
      venue: { address: "BGC Office Boardroom" },
      item: { name: "Breakfast Tray Package" },
    },
    pricing: { total: 12500 },
    payment: { amount: 0, status: "unpaid" },
  },
  {
    _id: "preview-9",
    eventType: "Anniversary Dinner",
    bookingType: "both",
    status: "confirmed",
    date: "2026-10-26T00:00:00.000Z",
    createdAt: "2026-09-12T18:05:00.000Z",
    catering: {
      pax: 40,
      time: { start: "18:00", end: "21:30" },
      item: { name: "Premium Dinner Buffet" },
    },
    venue: {
      pax: 45,
      time: { start: "17:00", end: "22:00" },
      item: { name: "Private Dining Hall", address: "Second Floor Hall" },
    },
    pricing: { total: 54000 },
    payment: { amount: 54000, status: "paid" },
  },
];

const MyBookings = () => {
  const { collections = [], isLoadingMyBookings } = useSelector(
    ({ bookings }) => bookings,
  );
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("upcoming");

  useEffect(() => {
    dispatch(MY_BOOKINGS());
  }, [dispatch]);

  const bookings = useMemo(() => {
    const data = collections.length > 0 ? previewBookings : previewBookings;

    return [...data].sort(
      (first, second) =>
        new Date(second?.date || second?.createdAt || 0) -
        new Date(first?.date || first?.createdAt || 0),
    );
  }, [collections]);

  const counts = useMemo(
    () =>
      bookings.reduce(
        (summary, booking) => {
          const status = getStatusKey(booking);
          summary.all += 1;
          if (activeStatuses.includes(status)) summary.upcoming += 1;
          if (status === "pending") summary.pending += 1;
          if (pastStatuses.includes(status)) summary.past += 1;
          return summary;
        },
        { all: 0, upcoming: 0, pending: 0, past: 0 },
      ),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = getStatusKey(booking);
      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && activeStatuses.includes(status)) ||
        (filter === "pending" && status === "pending") ||
        (filter === "past" && pastStatuses.includes(status));
      const matchesSearch =
        !search ||
        [
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
          <div className="grid gap-3 border-b px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center md:px-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Customer Reservations
              </p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
                My Bookings
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitor booking progress, event schedule, and payment status.
              </p>
            </div>

            <BookingSummary counts={counts} />
          </div>

          <div className="grid gap-2 p-2 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
            <BookingFilters
              value={filter}
              counts={counts}
              onChange={setFilter}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search bookings..."
                className="h-9 border-0 bg-muted/40 pl-9 shadow-none focus-visible:ring-1"
              />
            </div>
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

const BookingSummary = ({ counts }) => {
  const items = [
    { label: "Upcoming", value: counts.upcoming },
    { label: "Pending", value: counts.pending },
    { label: "Past", value: counts.past },
  ];

  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-md border bg-muted/20">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-18 border-r px-3 py-1.5 text-center last:border-r-0"
        >
          <p className="text-sm font-semibold leading-none">
            {item.value || 0}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
};

const BookingFilters = ({ value, counts, onChange }) => {
  const filters = [
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "past", label: "Past", count: counts.past },
    { value: "all", label: "All", count: counts.all },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto">
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium transition ${
            value === item.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          }`}
        >
          {item.label}
          <span
            className={`rounded-full px-1.5 text-[10px] leading-4 ${
              value === item.value
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {item.count || 0}
          </span>
        </button>
      ))}
    </div>
  );
};

const BookingTicket = ({ booking }) => {
  const status = getStatusMeta(booking);
  const type = getTypeMeta(booking);
  const services = getServices(booking);
  const payment = getPaymentSummary(booking);
  const date = getDateParts(booking?.date);
  const schedule = getSchedule(services);
  const primaryService = services[0];
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_10.5rem]">
        <div className="grid gap-3 p-3 md:grid-cols-[4.25rem_minmax(0,1fr)]">
          <div className="flex items-center gap-3 md:block">
            <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30 md:mx-auto">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                {date.month}
              </span>
              <span className="text-base font-semibold leading-none">
                {date.day}
              </span>
            </div>
            <div className="min-w-0 md:mt-1 md:text-center">
              <p className="text-xs font-semibold text-foreground">
                {date.weekday}
              </p>
              <p className="text-[11px] text-muted-foreground">{date.year}</p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold leading-6">
                  {booking?.eventType || "Event booking"}
                </h2>
                <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                  {primaryService?.name || "Booking details"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <span
                  className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold ${status.badgeClassName}`}
                >
                  <StatusIcon className="size-3.5" />
                  {status.label}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    payment.balance > 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {payment.balance > 0
                    ? `${Formatter.amount(payment.balance)} bal.`
                    : "Paid"}
                </span>
              </div>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <DetailBlock
                icon={<TypeIcon className="size-3 shrink-0" />}
                label="Type"
                value={type.label}
              />
              <DetailBlock
                icon={<Clock3 className="size-3 shrink-0" />}
                label="Time"
                value={schedule}
              />
              <DetailBlock
                icon={<UsersRound className="size-3 shrink-0" />}
                label="Guests"
                value={`${getTotalPax(booking)} pax`}
              />
              <DetailBlock
                icon={<MapPin className="size-3 shrink-0" />}
                label="Location"
                value={primaryService?.location || "-"}
              />
            </div>

            <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
              {services.map((service) => (
                <ServicePill key={service.type} service={service} />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/10 p-3 xl:border-l xl:border-t-0">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1 xl:gap-2">
            <AmountBlock
              label="Total"
              value={Formatter.amount(payment.total)}
            />
            <AmountBlock
              label="Balance"
              value={
                payment.balance > 0 ? Formatter.amount(payment.balance) : "Paid"
              }
              valueClassName={
                payment.balance > 0 ? "text-amber-700" : "text-emerald-700"
              }
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
      </div>
    </article>
  );
};

const DetailBlock = ({ icon, label, value }) => (
  <div className="min-w-0 rounded-md border bg-muted/15 px-2.5 py-1.5">
    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {label}
    </p>
    <p className="mt-0.5 truncate text-xs font-medium text-foreground">
      {value}
    </p>
  </div>
);

const AmountBlock = ({ label, value, valueClassName = "" }) => (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className={`mt-0.5 text-sm font-semibold ${valueClassName}`}>{value}</p>
  </div>
);

const ServicePill = ({ service }) => {
  const Icon = service.type === "venue" ? Building2 : Utensils;

  return (
    <span className="inline-flex min-w-0 items-center gap-1 rounded border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{service.name}</span>
    </span>
  );
};

const LoadingList = () => (
  <div className="grid gap-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="overflow-hidden rounded-lg border bg-card">
        <Skeleton className="h-0.5 rounded-none" />
        <div className="grid md:grid-cols-[4.5rem_minmax(0,1fr)_11.5rem]">
          <Skeleton className="h-20 rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-20 rounded-none" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
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

const NoResults = () => (
  <div className="rounded-lg border border-dashed bg-card px-4 py-12 text-center">
    <Search className="mx-auto size-5 text-muted-foreground" />
    <p className="mt-3 text-sm font-medium">No bookings found</p>
    <p className="mt-1 text-xs text-muted-foreground">
      Try another search or booking category.
    </p>
  </div>
);

const getBookingId = (booking) =>
  String(booking?._id || booking?.id || booking?.createdAt || booking?.date);

const getStatusKey = (booking) =>
  String(booking?.status || "pending").toLowerCase();

const getStatusMeta = (booking) => {
  const key = getStatusKey(booking);

  return (
    statusMeta[key] || {
      label: capitalize(key),
      icon: Clock3,
      badgeClassName: "border-border bg-muted/30 text-foreground",
      accentClassName: "bg-muted-foreground",
    }
  );
};

const getTypeMeta = (booking) => {
  const key = String(booking?.bookingType || "").toLowerCase();

  return (
    typeMeta[key] || {
      label: "Booking",
      icon: CalendarDays,
    }
  );
};

const getServices = (booking) => {
  if (!booking) return [];

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

const getPaymentSummary = (booking) => {
  const total = Number(booking?.pricing?.total || 0);
  const received = Number(booking?.payment?.amount || 0);

  return {
    total,
    received,
    balance: Math.max(total - received, 0),
  };
};

const getTotalPax = (booking) => {
  if (booking?.bookingType === "both") {
    return Math.max(
      Number(booking?.catering?.pax || 0),
      Number(booking?.venue?.pax || 0),
    );
  }

  return Number(booking?.[booking?.bookingType]?.pax || 0);
};

const getSchedule = (services) =>
  services.map((service) => service.time).find(Boolean) || "-";

const getDateParts = (date) => {
  if (!date) {
    return { month: "--", day: "--", weekday: "No date", year: "" };
  }

  const value = new Date(date);

  return {
    month: value.toLocaleString("en-US", { month: "short" }),
    day: value.toLocaleString("en-US", { day: "2-digit" }),
    weekday: value.toLocaleString("en-US", { weekday: "short" }),
    year: value.toLocaleString("en-US", { year: "numeric" }),
  };
};

const formatTimeRange = (time = {}) => {
  if (!time?.start && !time?.end) return "-";
  return `${Formatter.time(time?.start)} - ${Formatter.time(time?.end)}`;
};

const capitalize = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";

  return text.charAt(0).toUpperCase() + text.slice(1);
};
