import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BOOKINGS, COUNTS } from "@/services/redux/slices/events/bookings";
import Tabs from "./tabs";
import Body from "./body";
import { useRef } from "react";
import Approval from "../../admininistrator/events/bookings/schedule/approval";
import ReviewPayment from "../../admininistrator/events/bookings/schedule/reviewPayment";
import RecordPayment from "../../admininistrator/events/bookings/schedule/recordPayment";
import {
  CancelConfirmation,
  CompletedConfirmation,
  RejectionConfirmation,
} from "../../admininistrator/events/bookings/schedule/confirmation";

export default function TableOperation() {
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("All services");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [ascending, setAscending] = useState(false);
  const previousAscending = useRef(ascending);
  const [isSorting, setIsSorting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalModalMode, setApprovalModalMode] = useState("approve");
  const [schedModal, setSchedModal] = useState({
    approved: false,
    reviewPayment: false,
    view: false,
    recordPayment: false,
    completed: false,
    reject: false,
    cancel: false,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    let active = true;
    let request;
    setIsLoading(true);
    setIsSorting(previousAscending.current !== ascending);
    previousAscending.current = ascending;
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
        .then(({ data }) => {
          setPage(data?.pagination?.page);
        })
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
  }, [dispatch, status, query, service, payment, ascending, page, pageSize]);

  useEffect(() => {
    dispatch(COUNTS());
  }, [dispatch]);

  const handleAction = useCallback((booking, _action) => {
    const approvalModalActions = ["view", "update", "setup"];
    const action = approvalModalActions.includes(_action)
      ? "approved"
      : _action;
    setSchedModal((prev) => ({ ...prev, [action]: !prev[action] }));
    setSelected(booking);

    setApprovalModalMode(_action);
  }, []);

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
          pageSize={pageSize}
          setPageSize={setPageSize}
          isLoading={isLoading}
          isSorting={isSorting}
          setService={setService}
          setQuery={setQuery}
          setPayment={setPayment}
          setPage={setPage}
          setSelected={setSelected}
          setAscending={setAscending}
          resetFilters={resetFilters}
          handleAction={handleAction}
        />
      </div>
      <Approval
        isOpen={schedModal?.approved}
        setIsOpen={() => handleAction({}, "approved")}
        selected={selected}
        mode={approvalModalMode}
      />
      <ReviewPayment
        isOpen={schedModal?.reviewPayment}
        setIsOpen={() => handleAction({}, "reviewPayment")}
        selected={selected}
      />
      <RecordPayment
        isOpen={schedModal?.recordPayment}
        setIsOpen={() => handleAction({}, "recordPayment")}
        selected={selected}
      />
      <CompletedConfirmation
        isOpen={schedModal?.completed}
        setIsOpen={() => handleAction({}, "completed")}
        selected={selected}
      />
      <RejectionConfirmation
        isOpen={schedModal.reject}
        setIsOpen={(open) =>
          setSchedModal((prev) => ({ ...prev, reject: open }))
        }
        selected={selected}
      />
      <CancelConfirmation
        isOpen={schedModal.cancel}
        setIsOpen={(open) =>
          setSchedModal((prev) => ({ ...prev, cancel: open }))
        }
        selected={selected}
      />
    </section>
  );
}
