import {
  EventCalendarNav,
  EventCalendarNavNext,
  EventCalendarNavPrev,
  EventCalendarNavToday,
  EventCalendarTitle,
} from "@/components/reui/event-calendar/event-calendar-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Financial, Monthly } from "./overview";
import { Search } from "lucide-react";
import SearchCustomer from "./search";
import { useDispatch } from "react-redux";
import { SCHEDULE } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";

const Header = ({
  searchOpen,
  setSearchOpen,
  bookingSearch,
  setBookingSearch,
  bookingSearchResults,
  handleSearchResultClick,
  monthlySummary,
  selectDate,
  isLoading,
}) => {
  const dispatch = useDispatch();
  return (
    <div className="relative z-50 bg-muted/10 px-2 pb-2 sm:px-3">
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
            <EventCalendarNavToday
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              onClickCapture={() => {
                dispatch(SCHEDULE({ date: Formatter.localDate(new Date()) }));
                selectDate(new Date());
              }}
            />

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
              <TooltipContent side="top">Search bookings</TooltipContent>
            </Tooltip>
          </div>

          {/* Global booking search */}
          <SearchCustomer
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            bookingSearch={bookingSearch}
            setBookingSearch={setBookingSearch}
            bookingSearchResults={bookingSearchResults}
            handleSearchResultClick={handleSearchResultClick}
          />
        </div>

        {/* Financial overview */}
        <Financial isLoading={isLoading} monthlySummary={monthlySummary} />
      </EventCalendarNav>

      {/* Monthly booking overview */}
      <Monthly isLoading={isLoading} monthlySummary={monthlySummary} />
    </div>
  );
};

export default Header;
