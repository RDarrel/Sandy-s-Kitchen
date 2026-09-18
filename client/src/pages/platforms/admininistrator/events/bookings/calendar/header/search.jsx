import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { STATUS_LABELS, STATUS_DOTS } from "../../constant";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchCustomer = ({
  searchOpen,
  bookingSearch,
  setBookingSearch,
  bookingSearchResults,
  handleSearchResultClick = () => {},
  setSearchOpen = () => {},
}) => {
  return (
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
            onChange={(event) => setBookingSearch(event.target.value)}
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
                        onClick={() => handleSearchResultClick(booking)}
                        className="flex w-full min-w-0 items-start gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                      >
                        <span
                          aria-hidden
                          className={`mt-1.5 size-1.5 shrink-0 rounded-full ${STATUS_DOTS[booking.meta.status]}`}
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
                            {format(booking.start, "MMM d, h:mm a")}
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
                              {format(booking.start, "MMM d, h:mm a")}
                            </span>
                          </span>
                          <span className="hidden">
                            {booking.meta.customer} ·{" "}
                            {format(booking.start, "MMM d, h:mm a")}
                          </span>
                          <span className="hidden">
                            {booking.meta.venue} · {booking.meta.service}
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
                              {STATUS_LABELS[booking.meta.status]}
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
          <TooltipContent side="top">Close search</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default SearchCustomer;
