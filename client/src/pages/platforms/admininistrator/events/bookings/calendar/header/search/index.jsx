import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { STATUS_LABELS, STATUS_DOTS } from "../../../constant";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { SEARCH } from "@/services/redux/slices/events/bookings";
import { fullName } from "@/services/utilities";
import { capitalize } from "lodash";

/* -------------------------------------------------------------------------- */
/* SEARCH RESULT SKELETON                                                     */
/* -------------------------------------------------------------------------- */

const SearchResultsSkeleton = () => (
  <div role="status" aria-label="Searching bookings">
    <div className="flex items-center justify-between gap-3 border-b px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Searching bookings
      </span>

      <Skeleton className="h-2.5 w-12 rounded-sm" />
    </div>

    <div className="divide-y">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex min-w-0 items-start gap-2.5 px-3 py-3">
          <Skeleton className="mt-1.5 size-1.5 shrink-0 rounded-full" />

          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5">
            <Skeleton
              className={`h-3.5 rounded-sm ${index === 1 ? "w-28" : "w-36"}`}
            />

            <Skeleton className="h-3 w-24 justify-self-end rounded-sm" />

            <Skeleton className="h-2.5 w-24 rounded-sm" />

            <Skeleton className="h-2.5 w-20 justify-self-end rounded-sm" />

            <Skeleton
              className={`mt-0.5 h-2.5 rounded-sm ${
                index === 2 ? "w-24" : "w-32"
              }`}
            />

            <Skeleton className="mt-0.5 h-4 w-16 justify-self-end rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* SEARCH CUSTOMER                                                            */
/* -------------------------------------------------------------------------- */

const SearchCustomer = ({
  searchOpen,
  handleSearchResultClick = () => {},
  setSearchOpen = () => {},
}) => {
  const { isLoadingSearch, searchResults = [] } = useSelector(
    ({ bookings }) => bookings,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!searchOpen || !debouncedSearch) return;

    dispatch(SEARCH({ search: debouncedSearch }));
  }, [debouncedSearch, searchOpen, dispatch]);

  const handleSearch = (query) => {
    setSearch(query);
  };

  const handleClose = () => {
    setSearchOpen(false);
    setSearch("");
    setDebouncedSearch("");
  };

  const hasSearch = search.trim().length > 0;

  // Show the skeleton while waiting for debounce or API response.
  const isSearching =
    hasSearch && (search.trim() !== debouncedSearch || isLoadingSearch);

  return (
    <div
      className={`absolute inset-y-0 left-0 z-10 flex w-full max-w-md origin-left items-center transition-all duration-200 ease-out ${
        searchOpen
          ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
          : "pointer-events-none translate-x-2 scale-[0.98] opacity-0"
      }`}
    >
      <div className="flex w-full items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          {/* Search icon */}
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search bookings..."
            className="h-8 bg-background/95 pl-8 pr-3 text-xs"
            aria-label="Search bookings"
          />

          {/* Search dropdown */}
          {searchOpen && hasSearch && (
            <div className="absolute left-0 right-0 top-full z-[80] mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg">
              {isSearching ? (
                <SearchResultsSkeleton />
              ) : searchResults.length > 0 ? (
                <div>
                  {/* Results header */}
                  <div className="flex items-center justify-between gap-3 border-b px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Search results</span>

                    <span className="normal-case tracking-normal">
                      {searchResults.length} bookings
                    </span>
                  </div>

                  {/* Results */}
                  <div className="max-h-72 divide-y overflow-y-auto">
                    {searchResults.map((booking) => (
                      <button
                        key={booking._id || booking.id}
                        type="button"
                        onClick={() => handleSearchResultClick(booking)}
                        className="flex w-full min-w-0 items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                      >
                        {/* Status indicator */}
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                            STATUS_DOTS[booking.status] || "bg-muted-foreground"
                          }`}
                        />

                        {/* Booking information */}
                        <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1">
                          {/* Customer name */}
                          <span className="min-w-0 truncate text-[13px] font-semibold leading-4 text-foreground">
                            {fullName(booking.customer?.fullName)}
                          </span>

                          {/* Event date */}
                          <span className="shrink-0 text-right text-[11px] tabular-nums leading-4 text-muted-foreground">
                            {format(new Date(booking.date), "MMM d, h:mm a")}
                          </span>

                          {/* Booking reference */}
                          <span className="min-w-0 truncate font-mono text-[10px] leading-3 text-muted-foreground">
                            {booking.reference || "—"}
                          </span>

                          {/* Booking type */}
                          <span className="max-w-28 truncate text-right text-[11px] leading-3 text-muted-foreground">
                            {booking.bookingType === "both"
                              ? "Venue + Catering"
                              : capitalize(booking.bookingType)}
                          </span>

                          {/* Event name */}
                          <span className="min-w-0 truncate text-[11px] leading-4 text-muted-foreground">
                            {booking.eventType}
                          </span>

                          {/* Booking status */}
                          <span className="mt-0.5 flex justify-end">
                            <span className="inline-flex items-center rounded-sm border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium capitalize leading-none text-muted-foreground">
                              {STATUS_LABELS[booking.status] || booking.status}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center gap-1 px-3 py-5 text-center">
                  <Search className="mb-1 size-4 text-muted-foreground/50" />

                  <p className="text-xs font-medium text-foreground">
                    No bookings found
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    Try a different name, contact, or booking reference.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleClose}
              aria-label="Close search"
            >
              <X className="size-4" />
            </Button>
          </TooltipTrigger>

          <TooltipContent side="top">Close search</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default SearchCustomer;
