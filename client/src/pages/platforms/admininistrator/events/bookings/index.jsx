import { useCallback, useState } from "react";
import Schedule from "./schedule";
import Calendar from "./calendar";
import { cn } from "@/lib/utils";

function Bookings({ className, renderTopbar }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [bookingSearch, setBookingSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const isLoadingBookings = false;

  const selectDate = (date) => {
    setSelectedDate(date);
  };

  const handleSearchResultClick = (booking) => {
    setHighlightedBookingId(booking._id || booking.id);
    setSelectedDate(new Date(booking.date));
  };

  const handleHighlightReady = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const handleHighlightComplete = useCallback(() => {
    setHighlightedBookingId(null);
  }, []);

  return (
    <>
      {renderTopbar?.({
        searchOpen,
        setSearchOpen,
        highlightedBookingId,
        handleSearchResultClick,
      })}
    <div role={renderTopbar ? "main" : undefined} aria-label={renderTopbar ? "Booking calendar and selected schedule" : undefined} className={cn("min-w-0 w-full overflow-x-clip p-4", className)}>
      <div className="relative grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Calendar */}
        <div className="relative z-0 col-start-1 row-start-1 min-w-0">
          <Calendar
          hideSearch={Boolean(renderTopbar)}
          selectedDate={selectedDate}
          selectDate={selectDate}
          searchOpen={searchOpen}
          bookingSearch={bookingSearch}
          highlightedBookingId={highlightedBookingId}
          handleSearchResultClick={handleSearchResultClick}
          setBookingSearch={setBookingSearch}
          setSearchOpen={setSearchOpen}
          isLoading={isLoadingBookings}
          />
        </div>

        {/* Selected date bookings */}
        <div
          className={`relative z-20 col-span-full min-w-0 max-w-full justify-self-end transition-[width] duration-200 ease-out motion-reduce:transition-none ${
            isScheduleExpanded
              ? "row-start-1 w-full"
              : "row-start-2 w-full xl:row-start-1 xl:w-[340px]"
          }`}
        >
          <Schedule
            selectedDate={selectedDate}
            highlightedBookingId={highlightedBookingId}
            onHighlightReady={handleHighlightReady}
            onHighlightComplete={handleHighlightComplete}
            isExpanded={isScheduleExpanded}
            onToggleExpand={() => setIsScheduleExpanded((expanded) => !expanded)}
          />
        </div>
      </div>
    </div>
    </>
  );
}

export default Bookings;
