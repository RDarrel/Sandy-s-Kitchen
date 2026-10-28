import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { MonthsDropdown } from "react-day-picker";
import {
  TimePicker,
  TimePickerColumns,
  TimePickerPanel,
} from "@/components/reui/time-picker";
import {
  addMonths,
  addMinutes,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfMinute,
  startOfMonth,
} from "date-fns";
import { Formatter } from "@/services/utilities";

function RangeMonthsDropdown({ options, ...props }) {
  return <MonthsDropdown {...props} options={options?.filter((option) => !option.disabled)} />;
}

const roundUpTo15Minutes = (date) => {
  const normalized = startOfMinute(date);
  const remainder = normalized.getMinutes() % 15;

  if (remainder === 0) {
    return normalized.getTime() < date.getTime()
      ? addMinutes(normalized, 15)
      : normalized;
  }

  return addMinutes(normalized, 15 - remainder);
};

const formatDate = (date, isRange = false) => {
  const isValid = isRange
    ? isValidDate(date?.from) && isValidDate(date?.to)
    : isValidDate(date);

  if (!isValid) return `Select Date ${isRange ? " Range" : ""}`;
  if (isRange) {
    return `${Formatter.date(date?.from)} - ${Formatter.date(date?.to)}`;
  } else {
    return Formatter.date(date);
  }
};

const formatDateTime = (date) => {
  if (!isValidDate(date)) return "Select date and time";

  const now = new Date();

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(isSameYear(date, now) ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
};

const isValidDate = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime());

const toTimeValue = (date) => {
  if (!isValidDate(date)) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const mergeDateAndTime = (nextDate, currentDate) => {
  const source = isValidDate(currentDate) ? currentDate : new Date();
  const merged = new Date(nextDate);

  merged.setHours(source.getHours(), source.getMinutes(), 0, 0);

  return roundUpTo15Minutes(merged);
};

const mergeTime = (currentDate, time) => {
  const [hours = "0", minutes = "0"] = String(time || "").split(":");

  const merged = new Date(isValidDate(currentDate) ? currentDate : new Date());

  merged.setHours(Number(hours), Number(minutes), 0, 0);

  return merged;
};
const isTimeDisabled = (date, time, min, max) => {
  const selectedDateTime = mergeTime(date, time);

  if (min && isSameDay(date, min)) {
    if (isBefore(selectedDateTime, min)) return true;
  }

  if (max && isSameDay(date, max)) {
    if (isAfter(selectedDateTime, max)) return true;
  }
  return false;
};
const DatePicker = ({
  mode = "single",
  captionLayout = "",
  date = new Date(),
  highlightToday = true,
  withTime = false,
  required = false,
  disabled = false,
  hideCalendarOnSameDay = true, // if the min and max date is same date hide the calendar
  align = "end",
  min, //Min Date
  max, //Max Date
  setDate = () => {},
}) => {
  const [open, setOpen] = useState(false);
  const [rangeMonths, setRangeMonths] = useState(null);

  useEffect(() => {
    if (!open || !date || mode === "range") return;

    const currentDate = startOfMinute(date);

    if (max && isAfter(currentDate, startOfMinute(max))) {
      setDate(roundUpTo15Minutes(max));
      return;
    }

    if (min && isBefore(currentDate, startOfMinute(min))) {
      setDate(roundUpTo15Minutes(min));
    }
  }, [date, open, min, max, setDate, mode]);

  const isRange = mode === "range";
  const isDropdown = captionLayout === "dropdown";
  const isDropdownRange = isRange && isDropdown;
  const selectedMonth = (isRange ? date?.from : date) || new Date();
  const firstMonth = isDropdown
    ? startOfMonth(isBefore(selectedMonth, new Date(2025, 0, 1)) ? new Date(2025, 0, 1) : selectedMonth)
    : selectedMonth;
  const initialMonths = isDropdownRange
    ? [
        firstMonth,
        isValidDate(date?.to) && isAfter(date.to, firstMonth) && !isSameMonth(firstMonth, date.to)
          ? startOfMonth(date.to)
          : addMonths(firstMonth, 1),
      ]
    : [firstMonth];
  const calendarMonths = isDropdownRange && rangeMonths ? rangeMonths : initialMonths;

  const isSameDate = useMemo(() => {
    if (!hideCalendarOnSameDay) return false;
    if (min && max) {
      return isSameDay(new Date(min), new Date(max));
    } else {
      return false;
    }
  }, [min, max, hideCalendarOnSameDay]);

  const showTimeOnly = withTime && isSameDate;

  return (
    <div className="relative">
      {required && (
        <input
          type="text"
          value={date?.toISOString() || ""}
          onChange={() => {}}
          required
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      )}
      <Popover open={open} onOpenChange={(nextOpen) => {
        if (nextOpen && isDropdownRange) setRangeMonths(initialMonths);
        setOpen(nextOpen);
      }}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal ",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {withTime ? formatDateTime(date) : formatDate(date, isRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "max-w-[calc(100vw-1rem)] overflow-x-auto overflow-y-hidden p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "w-auto",
          )}
          align={align}
        >
          <div className={cn(showTimeOnly ? "w-max" : "min-w-max")}>
            <div
              className={cn(
                "flex items-start",
                showTimeOnly && "justify-center",
              )}
            >
              {!showTimeOnly &&
                calendarMonths.map((defaultMonth, index) => (
                  <Calendar
                    key={`${mode}-${captionLayout}-${index}`}
                    mode={mode}
                    selected={date}
                    defaultMonth={defaultMonth}
                    month={isDropdownRange ? defaultMonth : undefined}
                    onMonthChange={isDropdownRange ? (month) => {
                      const nextMonth = startOfMonth(month);
                      if (index === 0 && !isBefore(nextMonth, calendarMonths[1])) return;
                      if (index === 1 && !isAfter(nextMonth, calendarMonths[0])) return;
                      setRangeMonths(calendarMonths.map((current, calendarIndex) => calendarIndex === index ? nextMonth : current));
                    } : undefined}
                    captionLayout={captionLayout || "label"}
                    components={isDropdownRange ? { MonthsDropdown: RangeMonthsDropdown } : undefined}
                    startMonth={isDropdownRange && index === 1 ? addMonths(calendarMonths[0], 1) : isDropdown ? new Date(2025, 0, 1) : undefined}
                    endMonth={isDropdownRange && index === 0 ? addMonths(calendarMonths[1], -1) : undefined}
                    numberOfMonths={isRange && !isDropdown ? 2 : 1}
                    disabled={{
                      before: min ? startOfDay(new Date(min)) : undefined,
                      after: max ? endOfDay(new Date(max)) : undefined,
                    }}
                    onSelect={(selectedDate) => {
                      if (!selectedDate) return;

                      if (!isRange) {
                        const nextDate = withTime
                          ? mergeDateAndTime(selectedDate, date)
                          : selectedDate;

                        setDate(nextDate);
                      } else {
                        if (selectedDate.from && !selectedDate.to) {
                          setDate({
                            from: selectedDate.from,
                            to: selectedDate.from,
                          });
                        } else {
                          setDate(selectedDate);
                        }
                      }
                      if (!withTime && !isRange) setOpen(false);
                    }}
                    classNames={{
                      ...(!highlightToday && {
                        today:
                          "[&_button]:bg-transparent [&_button]:text-foreground",
                      }),
                    }}
                  />
                ))}
              {withTime && (
                <div
                  className={cn(
                    "flex items-stretch justify-center self-stretch px-3 sm:px-4",
                    showTimeOnly ? "py-2" : "border-s",
                  )}
                >
                  <TimePicker
                    aria-label="Publish time"
                    value={toTimeValue(date)}
                    onValueChange={(next) => {
                      if (next) setDate(mergeTime(date, next));
                    }}
                    minuteStep={15}
                    hourCycle={12}
                    isTimeDisabled={(time) =>
                      isTimeDisabled(date, time, min, max)
                    }
                  >
                    <TimePickerPanel className="h-full [--time-picker-rows:7] max-sm:[--time-picker-option-height:calc(var(--spacing)*6)]">
                      <TimePickerColumns className="h-full [&_[data-slot=time-picker-column]]:h-full max-sm:[&_[data-slot=time-picker-column-label]]:px-1 max-sm:[&_[data-slot=time-picker-column-label]]:text-[0.7rem] max-sm:[&_[data-slot=time-picker-column-list]]:px-1 max-sm:[&_[data-slot=time-picker-column]]:min-w-11 max-sm:[&_[data-slot=time-picker-option]]:text-xs" />
                    </TimePickerPanel>
                  </TimePicker>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
