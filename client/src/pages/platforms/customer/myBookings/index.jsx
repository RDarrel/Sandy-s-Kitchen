import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MY_BOOKINGS } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Utensils,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const statusMeta = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    className: "border-sky-200 bg-sky-50 text-sky-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

const statusColumns = [
  "pending",
  "approved",
  "completed",
  "cancelled",
  "rejected",
];

const typeMeta = {
  catering: {
    label: "Catering",
    icon: Utensils,
  },
  venue: {
    label: "Venue",
    icon: Building2,
  },
  both: {
    label: "Catering + Venue",
    icon: CalendarDays,
  },
};

const MyBookings = () => {
  const { collections, isLoadingMyBookings } = useSelector(
    ({ bookings }) => bookings,
  );
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  useEffect(() => {
    dispatch(MY_BOOKINGS());
  }, [dispatch]);

  const bookings = useMemo(
    () =>
      [...(collections || [])].sort(
        (first, second) =>
          new Date(second?.createdAt || second?.date || 0) -
          new Date(first?.createdAt || first?.date || 0),
      ),
    [collections],
  );

  const visibleBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return bookings;

    return bookings.filter((booking) =>
      [
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
        .includes(search),
    );
  }, [bookings, query]);

  const groupedBookings = useMemo(
    () =>
      statusColumns.reduce((groups, status) => {
        groups[status] = visibleBookings.filter(
          (booking) => getStatusKey(booking) === status,
        );

        return groups;
      }, {}),
    [visibleBookings],
  );

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <header className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your submitted event reservations by status.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookings..."
            className="h-10 pl-9"
          />
        </div>
      </header>

      <section className="mt-5">
        {isLoadingMyBookings ? (
          <LoadingBoard />
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="grid min-w-[980px] grid-cols-5 gap-3">
              {statusColumns.map((status) => (
                <StatusColumn
                  key={status}
                  status={status}
                  bookings={groupedBookings[status] || []}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState hasBookings={false} />
        )}
      </section>
    </main>
  );
};

export default MyBookings;

const StatusColumn = ({ status, bookings }) => {
  const meta = statusMeta[status] || statusMeta.pending;
  const Icon = meta.icon;

  return (
    <section className="rounded-md border bg-muted/10">
      <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`rounded-md border p-1.5 ${meta.className}`}>
            <Icon className="size-3.5" />
          </span>
          <h2 className="truncate text-sm font-semibold">{meta.label}</h2>
        </div>
        <span className="rounded-full border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {bookings.length}
        </span>
      </div>

      <div className="grid gap-2 p-2">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard key={booking?._id} booking={booking} />
          ))
        ) : (
          <div className="rounded-md border border-dashed bg-background px-3 py-8 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              No {meta.label.toLowerCase()} bookings
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const BookingCard = ({ booking }) => {
  const type = getTypeMeta(booking);
  const payment = getPaymentSummary(booking);
  const services = getServices(booking);
  const TypeIcon = type.icon;
  const primaryService = services[0];

  return (
    <article className="rounded-md border bg-background p-3 shadow-sm transition hover:border-primary/30">
      <h3 className="truncate text-sm font-semibold">
        {booking?.eventType || "Event booking"}
      </h3>

      <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <TypeIcon className="size-3.5 shrink-0" />
          <span className="truncate">{type.label}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">{formatDate(booking?.date)}</span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <UsersRound className="size-3.5 shrink-0" />
          <span className="truncate">{getTotalPax(booking)} guests</span>
        </span>
      </div>

      {primaryService && (
        <div className="mt-3 rounded-md bg-muted/20 p-2">
          <p className="truncate text-xs font-semibold">
            {primaryService.name}
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {primaryService.time}
          </p>
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {primaryService.location}
          </p>
        </div>
      )}

      <div className="mt-3 border-t pt-2">
        <MoneyRow label="Total" value={Formatter.amount(payment.total)} />
        <MoneyRow
          label="Balance"
          value={
            payment.balance > 0
              ? Formatter.amount(payment.balance)
              : "Fully paid"
          }
          className={
            payment.balance > 0 ? "text-amber-700" : "text-emerald-700"
          }
        />
      </div>
    </article>
  );
};

const MoneyRow = ({ label, value, className = "" }) => (
  <div className="mt-1 flex items-center justify-between gap-2 first:mt-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-xs font-semibold ${className}`}>{value}</span>
  </div>
);

const LoadingBoard = () => (
  <div className="overflow-x-auto pb-2">
    <div className="grid min-w-[980px] grid-cols-5 gap-3">
      {statusColumns.map((status) => (
        <section key={status} className="rounded-md border bg-muted/10">
          <div className="border-b bg-background px-3 py-2.5">
            <Skeleton className="h-7 w-28" />
          </div>
          <div className="grid gap-2 p-2">
            <Skeleton className="h-36 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
          </div>
        </section>
      ))}
    </div>
  </div>
);

const EmptyState = () => (
  <div className="rounded-md border border-dashed bg-background px-4 py-14 text-center">
    <div className="mx-auto flex size-11 items-center justify-center rounded-md border bg-muted/20">
      <CalendarDays className="size-5 text-muted-foreground" />
    </div>
    <h2 className="mt-4 text-base font-semibold">No bookings yet</h2>
    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
      Your submitted catering and venue reservations will appear here.
    </p>
  </div>
);

const getServices = (booking) => {
  if (!booking) return [];

  const services = [];

  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    services.push({
      type: "catering",
      name: booking?.catering?.item?.name || "Catering package",
      time: formatTimeRange(booking?.catering?.time),
      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        booking?.venue?.item?.address ||
        "-",
    });
  }

  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    services.push({
      type: "venue",
      name: booking?.venue?.item?.name || "Venue reservation",
      time: formatTimeRange(booking?.venue?.time),
      location: booking?.venue?.item?.address || "-",
    });
  }

  return services;
};

const getStatusKey = (booking) =>
  String(booking?.status || "pending").toLowerCase();

const getTypeMeta = (booking) => {
  const key = String(booking?.bookingType || "").toLowerCase();

  return (
    typeMeta[key] || {
      label: "Booking",
      icon: CalendarDays,
    }
  );
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

const formatDate = (date) => (date ? Formatter.date(date) : "-");

const formatTimeRange = (time = {}) => {
  if (!time?.start && !time?.end) return "-";
  return `${Formatter.time(time.start)} - ${Formatter.time(time.end)}`;
};
