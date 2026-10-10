import { useState } from "react";

import Schedule from "./schedule";
import Calendar from "./calendar";

function Bookings() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [bookingSearch, setBookingSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const isLoadingBookings = false;

  const selectDate = (date) => {
    setSelectedDate(date);
  };

  const handleSearchResultClick = (booking) => {
    setSelectedDate(new Date(booking.date));
    setSearchOpen(false);
  };

  return (
    <div className="w-full p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Calendar */}
        <Calendar
          selectedDate={selectedDate}
          selectDate={selectDate}
          searchOpen={searchOpen}
          bookingSearch={bookingSearch}
          handleSearchResultClick={handleSearchResultClick}
          setBookingSearch={setBookingSearch}
          setSearchOpen={setSearchOpen}
          isLoading={isLoadingBookings}
        />

        {/* Selected date bookings */}
        <Schedule selectedDate={selectedDate} />
      </div>
    </div>
  );
}

export default Bookings;
