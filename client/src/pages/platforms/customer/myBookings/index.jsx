import { MY_BOOKINGS } from "@/services/redux/slices/events/bookings";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStatusKey } from "./utils";
import { UPCOMING_STATUSES } from "./constant";
import Header from "./header";
import Ticket from "./ticket";
import TicketSkeleton from "./ticket/skeleton";
import EmptyBooking from "./empty";
const MyBookings = () => {
  const { collections = [], isLoadingMyBookings } = useSelector(
    ({ bookings }) => bookings,
  );
  const dispatch = useDispatch();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    dispatch(MY_BOOKINGS());
  }, [dispatch]);

  const bookings = useMemo(() => {
    const data = collections;
    return [...data].sort((first, second) => {
      const firstStatus = getStatusKey(first);
      const secondStatus = getStatusKey(second);

      const firstActive =
        firstStatus === "pending" || UPCOMING_STATUSES.includes(firstStatus);

      const secondActive =
        secondStatus === "pending" || UPCOMING_STATUSES.includes(secondStatus);

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

        if (UPCOMING_STATUSES.includes(status)) {
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

  useEffect(() => {
    if (isLoadingMyBookings || filter) return;

    if (counts.upcoming > 0) {
      setFilter("upcoming");
    } else if (counts.pending > 0) {
      setFilter("pending");
    } else {
      setFilter("all");
    }
  }, [filter, counts, isLoadingMyBookings]);

  const filteredBookings = useMemo(() => {
    const search = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const status = getStatusKey(booking);

      const matchesFilter =
        filter === "all" ||
        (filter === "upcoming" && UPCOMING_STATUSES.includes(status)) ||
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
        <Header
          query={query}
          filter={filter}
          counts={counts}
          setQuery={setQuery}
          setFilter={setFilter}
        />

        {isLoadingMyBookings ? (
          <LoadingList />
        ) : bookings.length === 0 ? (
          <EmptyBooking />
        ) : filteredBookings.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid gap-2">
            {filteredBookings.map((booking) => (
              <Ticket key={booking?._id} booking={booking} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MyBookings;

const LoadingList = () => {
  return (
    <div className="grid gap-2">
      {[1, 2, 3].map((item) => (
        <TicketSkeleton key={item} />
      ))}
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
