import { EventCalendar } from "@/components/reui/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content";
import { Card, CardContent } from "@/components/ui/card";
import { BOOKING_STREAMS } from "../constant";
import Cell from "./cell";
import Header from "./header";
import CalendarSkeleton from "./skeleton";
import { Formatter } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { CALENDAR } from "@/services/redux/slices/events/bookings";

const Calendar = ({
  events,
  selectedDate,
  selectDate,
  monthlySummary,
  bookingSearchResults,
  searchOpen,
  bookingSearch,
  handleSearchResultClick,
  setBookingSearch,
  setSearchOpen,
  isLoading = false,
}) => {
  const { calendar } = useSelector(({ bookings }) => bookings);

  const dispatch = useDispatch();
  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <Card className="w-full py-0">
      <CardContent className="p-0">
        <EventCalendar
          events={(calendar?.days || []).map((day) => ({
            ...day,
            start: new Date(day?.start),
            end: new Date(day?.end),
          }))}
          defaultView="month"
          resources={BOOKING_STREAMS}
          renderMoreIndicator={renderMoreIndicator}
          renderMonthCell={(props) =>
            Cell({
              ...props,
              selectedDay: selectedDate,
            })
          }
          interactions={{
            drag: false,
            resize: false,
            selectSlot: false,
          }}
          onSlotClick={({ date }) => selectDate(date)}
          onEventClick={(occurrence) =>
            selectDate(occurrence.start ?? occurrence.event.start)
          }
          onRangeChange={({ range }) => {
            dispatch(
              CALENDAR({
                start: Formatter?.localDate(range?.start),
                end: Formatter.localDate(range?.end),
              }),
            );
          }}
          maxEventsPerCell={3}
          viewSettings={{
            weekends: true,
            weekNumbers: false,
            nowIndicator: true,
            offDays: false,
          }}
          eventTooltip
          showDayAddButton={false}
          offDays
          className="h-[660px] w-full"
          classNames={{
            monthDayHeader: "text-center",
            monthCell: "cursor-pointer hover:bg-muted/40 transition-colors",
            monthCellContent: "gap-1",
            moreIndicator: "mt-0.5 px-1",
          }}
        >
          {/* Calendar header */}
          <Header
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            bookingSearch={bookingSearch}
            setBookingSearch={setBookingSearch}
            bookingSearchResults={bookingSearchResults}
            handleSearchResultClick={handleSearchResultClick}
            monthlySummary={monthlySummary}
          />

          <EventCalendarContent />
        </EventCalendar>
      </CardContent>
    </Card>
  );
};

export default Calendar;

function renderMoreIndicator({ count }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border bg-background px-2 text-[10px] font-semibold text-muted-foreground shadow-sm">
      +{count} more
    </span>
  );
}
