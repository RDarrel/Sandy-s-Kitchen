import { useMemo, useState } from "react";
import {
  addDays,
  addMinutes,
  format,
  setHours,
  startOfDay,
  startOfWeek,
} from "date-fns";
import Schedule from "./schedule";
import Calendar from "./calendar";
import { STATUS_COLORS, STATUS_ORDER } from "./constant";

const confirmedStatuses = ["approved", "setup", "completed"];

function buildBookingEvents(anchor) {
  const week = startOfWeek(startOfDay(anchor), {
    weekStartsOn: 0,
  });

  const at = (dayOffset, hour, minute = 0) =>
    addMinutes(setHours(addDays(week, dayOffset), hour), minute);

  return [
    {
      id: "santos-wedding",
      title: "Santos Wedding",
      start: at(2, 10),
      end: at(2, 14),
      resourceId: "full-service",
      color: STATUS_COLORS.approved,
      meta: {
        customer: "Angela Santos",
        service: "Catering + Venue",
        venue: "Garden Pavilion",
        guests: 120,
        status: "approved",
        payment: "partial",
        contact: "0917 234 8890",
        amount: 52000,
        received: 25000,
      },
    },
    {
      id: "cruz-birthday",
      title: "Cruz 18th Birthday",
      start: at(3, 16),
      end: at(3, 20),
      resourceId: "venue",
      color: STATUS_COLORS.pending,
      meta: {
        customer: "Liza Cruz",
        service: "Venue reservation",
        venue: "Function Hall A",
        guests: 80,
        status: "pending",
        payment: "unpaid",
        contact: "0998 112 4501",
        amount: 18000,
        received: 0,
      },
    },
    {
      id: "lim-corporate-lunch",
      title: "Lim Corporate Lunch",
      start: at(4, 11),
      end: at(4, 13),
      resourceId: "catering",
      color: STATUS_COLORS.approved,
      meta: {
        customer: "Lim Trading",
        service: "Packed buffet",
        venue: "Client office",
        guests: 45,
        status: "approved",
        payment: "paid",
        contact: "0916 555 2210",
        amount: 18500,
        received: 18500,
      },
    },
    {
      id: "garcia-reunion",
      title: "Garcia Reunion",
      start: at(4, 15),
      end: at(4, 19),
      resourceId: "full-service",
      color: STATUS_COLORS.setup,
      meta: {
        customer: "Garcia Family",
        service: "Catering + Venue",
        venue: "Main Dining Hall",
        guests: 95,
        status: "setup",
        payment: "partial",
        contact: "0927 443 7109",
        amount: 36000,
        received: 15000,
      },
    },
    {
      id: "flores-venue-ocular",
      title: "Flores Ocular Visit",
      start: at(4, 17, 30),
      end: at(4, 18, 30),
      resourceId: "venue",
      color: STATUS_COLORS.pending,
      meta: {
        customer: "Nina Flores",
        service: "Venue reservation",
        venue: "Garden Pavilion",
        guests: 25,
        status: "pending",
        payment: "unpaid",
        contact: "0905 882 3300",
        amount: 5000,
        received: 0,
      },
    },
    {
      id: "dela-pena-baptism",
      title: "Dela Pena Baptism",
      start: at(6, 9),
      end: at(6, 12),
      resourceId: "catering",
      color: STATUS_COLORS.approved,
      meta: {
        customer: "Mark Dela Pena",
        service: "Catering only",
        venue: "St. Joseph Parish Hall",
        guests: 60,
        status: "approved",
        payment: "paid",
        contact: "0918 700 1911",
        amount: 12000,
        received: 12000,
      },
    },
    {
      id: "navarro-anniversary",
      title: "Navarro Anniversary",
      start: at(9, 18),
      end: at(9, 22),
      resourceId: "full-service",
      color: STATUS_COLORS.pending,
      meta: {
        customer: "Mia Navarro",
        service: "Dinner buffet + venue",
        venue: "Garden Pavilion",
        guests: 50,
        status: "pending",
        payment: "unpaid",
        contact: "0917 222 4135",
        amount: 28000,
        received: 0,
      },
    },
    {
      id: "reyes-thanksgiving",
      title: "Reyes Thanksgiving",
      start: at(17, 12),
      end: at(17, 16),
      resourceId: "catering",
      color: STATUS_COLORS.completed,
      meta: {
        customer: "Jon Reyes",
        service: "Catering only",
        venue: "Private residence",
        guests: 70,
        status: "completed",
        payment: "paid",
        contact: "0999 808 4412",
        amount: 22000,
        received: 22000,
      },
    },
  ];
}

function Bookings() {
  const events = useMemo(() => buildBookingEvents(new Date()), []);

  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const [statusFilter, setStatusFilter] = useState("pending");
  const [bookingSearch, setBookingSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const isLoadingBookings = false;

  const selectDate = (date) => {
    const key = format(date, "yyyy-MM-dd");

    const dayBookings = events.filter(
      (event) => format(event.start, "yyyy-MM-dd") === key,
    );

    setSelectedDate(date);

    setStatusFilter(
      dayBookings.some((booking) => booking.meta.status === "pending")
        ? "pending"
        : "all",
    );
  };

  const selectedBookings = useMemo(() => {
    const selectedKey = format(selectedDate, "yyyy-MM-dd");

    return events
      .filter((event) => format(event.start, "yyyy-MM-dd") === selectedKey)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  const selectedBookingsByStatus = useMemo(() => {
    const filteredBookings =
      statusFilter === "all"
        ? selectedBookings
        : selectedBookings.filter(
            (booking) => booking.meta.status === statusFilter,
          );

    return STATUS_ORDER.map((status) => ({
      status,
      bookings: filteredBookings.filter(
        (booking) => booking.meta.status === status,
      ),
    })).filter((group) => group.bookings.length > 0);
  }, [selectedBookings, statusFilter]);

  const selectedStatusCounts = useMemo(() => {
    return selectedBookings.reduce(
      (counts, booking) => ({
        ...counts,
        [booking.meta.status]: (counts[booking.meta.status] || 0) + 1,
      }),
      {
        all: selectedBookings.length,
      },
    );
  }, [selectedBookings]);

  const bookingSearchResults = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();

    if (!query) return [];

    return events
      .filter((event) => {
        const meta = event.meta || {};
        const searchable = [
          event.title,
          meta.customer,
          meta.venue,
          meta.service,
          meta.status,
          meta.payment,
          meta.contact,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 6);
  }, [bookingSearch, events]);

  const handleSearchResultClick = (booking) => {
    setSelectedDate(booking.start);
    setStatusFilter(booking.meta?.status || "all");
    setSearchOpen(false);
  };

  const monthlySummary = useMemo(() => {
    const monthKey = format(selectedDate, "yyyy-MM");

    const monthBookings = events.filter(
      (event) => format(event.start, "yyyy-MM") === monthKey,
    );

    const statusCountsForMonth = monthBookings.reduce(
      (counts, booking) => ({
        ...counts,
        [booking.meta.status]: (counts[booking.meta.status] || 0) + 1,
      }),
      {},
    );

    const confirmedBookings = monthBookings.filter((booking) =>
      confirmedStatuses.includes(booking.meta.status),
    );

    const confirmed = confirmedBookings.reduce(
      (total, booking) => total + Number(booking.meta.amount || 0),
      0,
    );

    const received = confirmedBookings.reduce(
      (total, booking) => total + Number(booking.meta.received || 0),
      0,
    );

    const toCollect = Math.max(confirmed - received, 0);

    return {
      label: format(selectedDate, "MMMM yyyy"),
      total: monthBookings.length,
      confirmed,
      received,
      toCollect,
      statuses: statusCountsForMonth,
    };
  }, [events, selectedDate]);
  return (
    <div className="w-full p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Calendar */}
        <Calendar
          events={events}
          selectedDate={selectedDate}
          selectDate={selectDate}
          monthlySummary={monthlySummary}
          bookingSearchResults={bookingSearchResults}
          searchOpen={searchOpen}
          bookingSearch={bookingSearch}
          handleSearchResultClick={handleSearchResultClick}
          setBookingSearch={setBookingSearch}
          setSearchOpen={setSearchOpen}
          isLoading={isLoadingBookings}
        />

        {/* Selected date bookings */}
        <Schedule
          selectedBookings={selectedBookings}
          selectedStatusCounts={selectedStatusCounts}
          selectedBookingsByStatus={selectedBookingsByStatus}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedDate={selectedDate}
          isLoading={isLoadingBookings}
        />
      </div>
    </div>
  );
}

export default Bookings;
