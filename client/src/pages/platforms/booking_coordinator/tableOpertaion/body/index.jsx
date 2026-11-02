import { ArrowUp, CalendarDays, LoaderCircle, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Filters from "./filters";
import Booking from "./booking";
import Pagination from "./pagination";
import { useSelector } from "react-redux";
import { toBookingRow } from "../bookingRow";
import { getStatusLabel } from "../utils";

const Body = ({
  query,
  service,
  setService,
  setQuery,
  payment,
  setPayment,
  setPage,
  setSelected,
  hasFilters = false,
  status,
  error,
  ascending,
  setAscending,
  resetFilters,
  page,
  pageSize,
  setPageSize,
  isLoading,
  isSorting = false,
  handleAction,
}) => {
  const { bookings } = useSelector(({ bookings }) => bookings);
  const isSearching = Boolean(query?.trim());

  const visible = isLoading || error ? [] : bookings.map(toBookingRow);
  return (
    <div
      className={`relative z-0 -mt-px min-w-0 overflow-hidden rounded-b-xl rounded-tr-xl border border-primary/40 bg-card shadow-xs transition-[border-top-left-radius] duration-0 motion-reduce:transition-none ${status === "all" ? "rounded-tl-none delay-250" : "rounded-tl-xl delay-0"}`}
    >
      <Filters
        query={query}
        service={service}
        setService={setService}
        setQuery={setQuery}
        payment={payment}
        setPayment={setPayment}
        setPage={setPage}
        resetFilters={resetFilters}
        status={status}
      />
      <Table className="min-w-[1200px] table-fixed text-sm leading-5">
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[23%]" />
          <col className="w-[22%]" />
          <col className="w-[8%]" />
          <col className="w-[15%]" />
          <col className="w-[11%]" />
          <col className="w-[7%]" />
        </colgroup>
        <TableHeader className="border-b border-border bg-card [&_th]:h-11 [&_th]:px-4 [&_th]:text-[13px] [&_th]:font-semibold [&_th]:text-foreground">
          <TableRow className="hover:bg-transparent">
            <TableHead>Booking</TableHead>
            <TableHead>Customer / Event</TableHead>
            <TableHead aria-sort={ascending ? "ascending" : "descending"}>
              <button
                type="button"
                title={
                  ascending
                    ? "Earliest first. Click to show latest first."
                    : "Latest first. Click to show earliest first."
                }
                onClick={() => {
                  setAscending(!ascending);
                  setPage(1);
                }}
                className="group flex cursor-pointer items-center gap-1.5 rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
              >
                Schedule
                <ArrowUp
                  aria-hidden="true"
                  className={`size-3.5 text-primary transition-transform duration-150 motion-reduce:transition-none ${ascending ? "" : "rotate-180"}`}
                />
              </button>
            </TableHead>
            <TableHead className="text-right">Guests</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-4 [&_td]:py-3.5">
          {visible.map((booking) => (
            <Booking
              booking={booking}
              key={booking?._id}
              setSelected={setSelected}
              handleAction={handleAction}
            />
          ))}
        </TableBody>
      </Table>
      {!visible.length && (
        <div
          role={error ? "alert" : "status"}
          className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"
        >
          <span
            aria-hidden="true"
            className="mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground"
          >
            {isLoading ? (
              <LoaderCircle className="size-5 animate-spin text-primary motion-reduce:animate-none" />
            ) : hasFilters ? (
              <Search className="size-5" />
            ) : (
              <CalendarDays className="size-5" />
            )}
          </span>

          <p className="text-base font-semibold text-foreground">
            {isLoading
              ? isSorting
                ? "Sorting bookings..."
                : isSearching
                  ? "Searching bookings..."
                  : "Loading bookings..."
              : error
                ? "Unable to load bookings"
                : hasFilters
                  ? "No matching bookings found"
                  : status !== "all"
                    ? `No ${getStatusLabel(status).toLowerCase()} bookings`
                    : "No bookings available"}
          </p>

          <p className="mt-1.5 max-w-full text-sm leading-6 text-muted-foreground sm:whitespace-nowrap">
            {isLoading
              ? isSorting
                ? "Updating the booking list."
                : isSearching
                  ? "Finding bookings that match your search."
                  : "Please wait while we retrieve the booking records."
              : error
                ? "We couldn't retrieve the booking records. Please try again."
                : hasFilters
                  ? "Try adjusting your search or filters."
                  : status !== "all"
                    ? "There are no bookings with this status at the moment."
                    : "Booking records will appear here once they are submitted."}
          </p>

          {!isLoading && !error && hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4 rounded-lg"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
      <Pagination
        page={page}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPage={setPage}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Body;
