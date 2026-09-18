import { EventCalendar } from "@/components/reui/event-calendar/event-calendar";
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content";
import { Card, CardContent } from "@/components/ui/card";
import { BOOKING_STREAMS } from "../constant";
import Cell from "./cell";
import Header from "./header";
import CalendarSkeleton from "./skeleton";
import { Formatter } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { CALENDAR, SCHEDULE } from "@/services/redux/slices/events/bookings";

const Calendar = ({
  selectedDate,
  selectDate,
  monthlySummary,
  bookingSearchResults,
  searchOpen,
  bookingSearch,
  handleSearchResultClick,
  setBookingSearch,
  setSearchOpen,
}) => {
  const { calendar, isLoadingCalendar: isLoading } = useSelector(
    ({ bookings }) => bookings,
  );
  const dispatch = useDispatch();
  return (
    <Card className="w-full py-0" key={"calendar"}>
      <CardContent className="p-0 relative">
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
          onSlotClick={({ date }) =>
            dispatch(SCHEDULE({ date: Formatter.localDate(new Date(date)) }))
          }
          onEventClick={(occurrence) =>
            selectDate(occurrence.start ?? occurrence.event.start)
          }
          onRangeChange={({ range }) => {
            const start = range.start;
            const end = range.end;

            // Get a date roughly in the middle of the visible calendar range
            const middleDate = new Date((start.getTime() + end.getTime()) / 2);

            // First day of displayed month
            const monthStart = new Date(
              middleDate.getFullYear(),
              middleDate.getMonth(),
              1,
            );

            // First day of next month (exclusive end)
            const monthEnd = new Date(
              middleDate.getFullYear(),
              middleDate.getMonth() + 1,
              1,
            );

            dispatch(
              CALENDAR({
                start: Formatter.localDate(start),
                end: Formatter.localDate(end),
                monthStart: Formatter.localDate(monthStart),
                monthEnd: Formatter.localDate(monthEnd),
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
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-xl">
            <CalendarSkeleton />
          </div>
        )}
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
