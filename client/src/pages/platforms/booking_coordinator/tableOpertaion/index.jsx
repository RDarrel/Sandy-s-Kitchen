import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BOOKINGS, COUNTS } from "@/services/redux/slices/events/bookings";
import Tabs from "./tabs";
import Body from "./body";

const pageSize = 5;

export default function TableOperation() {
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("All services");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [ascending, setAscending] = useState(true);
  const [, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let request;
    setIsLoading(true);
    setError("");
    // Ignore superseded requests so slow responses cannot replace newer filters.
    const timer = setTimeout(() => {
      request = dispatch(
        BOOKINGS({
          status,
          search: query.trim(),
          service: {
            "All services": "all",
            Catering: "catering",
            Venue: "venue",
            "Catering + Venue": "both",
          }[service],
          paymentStatus: payment,
          sortOrder: ascending ? "asc" : "desc",
          page,
          limit: pageSize,
        }),
      );
      request
        .unwrap()
        .catch((reason) => {
          if (!active) return;
          setError(
            typeof reason === "string"
              ? reason
              : reason?.message || "Unable to load bookings. Please try again.",
          );
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
      // Prevent superseded thunks from replacing the rows in Redux.
      request?.abort();
    };
  }, [dispatch, status, query, service, payment, ascending, page]);

  useEffect(() => {
    dispatch(COUNTS());
  }, [dispatch]);

  const hasFilters = Boolean(
    query || service !== "All services" || payment !== "all",
  );
  const resetFilters = () => {
    setQuery("");
    setService("All services");
    setPayment("all");
    setPage(1);
  };

  return (
    <section
      aria-label="Booking table"
      aria-busy={isLoading}
      className="mx-auto w-full max-w-[1600px] px-4 pt-2 pb-8 sm:px-6"
    >
      <div className="min-w-0">
        <Tabs status={status} setStatus={setStatus} setPage={setPage} />
        <Body
          query={query}
          service={service}
          payment={payment}
          hasFilters={hasFilters}
          status={status}
          ascending={ascending}
          error={error}
          page={page}
          isLoading={isLoading}
          setService={setService}
          setQuery={setQuery}
          setPayment={setPayment}
          setPage={setPage}
          setSelected={setSelected}
          setAscending={setAscending}
          resetFilters={resetFilters}
        />
      </div>
    </section>
  );
}
