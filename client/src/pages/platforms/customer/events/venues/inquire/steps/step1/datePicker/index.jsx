import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import { CalendarIcon, Check, Clock3, Loader2 } from "lucide-react";

import {
  TimePicker,
  TimePickerColumns,
  TimePickerPanel,
} from "@/components/reui/time-picker";

import {
  GET_RESERVED_SCHEDULES,
  GET_AVAILABLE_UNTIL,
} from "@/services/redux/slices/events/venues";
import { isSameYear } from "date-fns";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const TIME_STEP_MINUTES = 15;
const MIN_BOOKING_MINUTES = 60;

/* -------------------------------------------------------------------------- */
/* FORMATTERS                                                                 */
/* -------------------------------------------------------------------------- */

const isValidDate = (date) =>
  date instanceof Date && !Number.isNaN(date.getTime());

const formatDate = (date) =>
  isValidDate(date)
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date";

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

const formatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDateForQuery = (date) => {
  if (!isValidDate(date)) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* -------------------------------------------------------------------------- */
/* TIME HELPERS                                                               */
/* -------------------------------------------------------------------------- */

const toTimeValue = (date) => {
  if (!isValidDate(date)) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const mergeTime = (currentDate, time) => {
  if (!isValidDate(currentDate)) return null;

  const [hours = "0", minutes = "0"] = String(time || "").split(":");

  const merged = new Date(currentDate);

  merged.setHours(Number(hours), Number(minutes), 0, 0);

  return merged;
};

/* -------------------------------------------------------------------------- */
/* DATE HELPERS                                                               */
/* -------------------------------------------------------------------------- */

const startOfDay = (date) => {
  const value = new Date(date);

  value.setHours(0, 0, 0, 0);

  return value;
};

const startOfNextDay = (date) => {
  const value = startOfDay(date);

  value.setDate(value.getDate() + 1);

  return value;
};

const isSameDay = (firstDate, secondDate) => {
  if (!isValidDate(firstDate) || !isValidDate(secondDate)) {
    return false;
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

/* -------------------------------------------------------------------------- */
/* START AVAILABILITY HELPERS                                                 */
/* -------------------------------------------------------------------------- */

const hasStartConflict = (candidateStart, reservedSchedules = []) => {
  if (!isValidDate(candidateStart)) {
    return true;
  }

  const minimumEnd = new Date(
    candidateStart.getTime() + MIN_BOOKING_MINUTES * 60 * 1000,
  );

  return reservedSchedules.some(({ startAt, endAt }) => {
    const reservedStart = new Date(startAt);
    const reservedEnd = new Date(endAt);

    if (!isValidDate(reservedStart) || !isValidDate(reservedEnd)) {
      return false;
    }

    /*
     * TimePicker works at minute precision.
     */
    reservedStart.setSeconds(0, 0);
    reservedEnd.setSeconds(0, 0);

    /*
     * Half-open overlap.
     *
     * Touching boundaries are allowed:
     *
     * Customer:     12:00 AM -> 1:00 AM
     * Next booking:             1:00 AM -> ...
     */
    return candidateStart < reservedEnd && minimumEnd > reservedStart;
  });
};

const getFirstAvailableStartTime = (date, reservedSchedules = []) => {
  if (!isValidDate(date)) {
    return null;
  }

  const dayStart = startOfDay(date);
  const dayEnd = startOfNextDay(date);

  const now = new Date();

  for (
    let candidate = new Date(dayStart);
    candidate < dayEnd;
    candidate = new Date(candidate.getTime() + TIME_STEP_MINUTES * 60 * 1000)
  ) {
    /*
     * Past Start Times cannot be selected.
     */
    if (candidate < now) {
      continue;
    }

    if (!hasStartConflict(candidate, reservedSchedules)) {
      return candidate;
    }
  }

  return null;
};

const getAvailableStartRanges = (date, reservedSchedules = []) => {
  if (!isValidDate(date)) {
    return [];
  }

  const dayStart = startOfDay(date);
  const dayEnd = startOfNextDay(date);

  const now = new Date();

  const availableSlots = [];

  for (
    let candidate = new Date(dayStart);
    candidate < dayEnd;
    candidate = new Date(candidate.getTime() + TIME_STEP_MINUTES * 60 * 1000)
  ) {
    /*
     * Do not include past Start Times.
     */
    if (candidate < now) {
      continue;
    }

    if (!hasStartConflict(candidate, reservedSchedules)) {
      availableSlots.push(new Date(candidate));
    }
  }

  if (!availableSlots.length) {
    return [];
  }

  /*
   * Group consecutive selectable 15-minute slots.
   */
  const availableRanges = [];

  let rangeStart = availableSlots[0];
  let previous = availableSlots[0];

  for (let index = 1; index < availableSlots.length; index += 1) {
    const current = availableSlots[index];

    const expectedNext = new Date(
      previous.getTime() + TIME_STEP_MINUTES * 60 * 1000,
    );

    if (current.getTime() !== expectedNext.getTime()) {
      availableRanges.push({
        start: new Date(rangeStart),
        end: new Date(previous),
      });

      rangeStart = current;
    }

    previous = current;
  }

  availableRanges.push({
    start: new Date(rangeStart),
    end: new Date(previous),
  });

  return availableRanges;
};

/* -------------------------------------------------------------------------- */
/* DATE PICKER                                                                */
/* -------------------------------------------------------------------------- */

const DatePicker = ({
  type = "start",

  venueId,

  date = null,
  setDate = () => {},

  /*
   * Required by the End picker.
   */
  startAt = null,

  /*
   * Useful when editing an existing booking.
   */
  excludeBookingId = null,

  onPreviewDate = () => {},

  withTime = false,

  align = "end",
  required = true,

  ...props
}) => {
  const dispatch = useDispatch();

  const {
    reservedSchedules = [],
    validUntil = null,
    isLoading = false,
  } = useSelector(({ venues }) => venues);

  const [open, setOpen] = useState(false);

  /*
   * The selected calendar day is kept separately
   * from the selected Date + Time.
   *
   * This allows us to show a selected day even when
   * that day has no available time.
   */
  const [draftDay, setDraftDay] = useState(
    isValidDate(date) ? startOfDay(date) : null,
  );

  /*
   * draftDate represents an actual valid Date + Time.
   *
   * null means:
   * - no time has been selected yet, or
   * - selected day has no available time.
   */
  const [draftDate, setDraftDate] = useState(isValidDate(date) ? date : null);

  const selectedDate = isValidDate(date) ? date : null;

  const selectedStartAt = isValidDate(startAt)
    ? startAt
    : startAt
      ? new Date(startAt)
      : null;

  const isStartPicker = type === "start";
  const isEndPicker = type === "end";

  /* ------------------------------------------------------------------------ */
  /* AVAILABLE UNTIL                                                          */
  /* ------------------------------------------------------------------------ */

  const availableUntil = useMemo(() => {
    if (!validUntil) {
      return null;
    }

    const value = new Date(validUntil);

    if (!isValidDate(value)) {
      return null;
    }

    /*
     * TimePicker uses minute precision.
     */
    value.setSeconds(0, 0);

    return value;
  }, [validUntil]);

  /* ------------------------------------------------------------------------ */
  /* MINIMUM END                                                              */
  /* ------------------------------------------------------------------------ */

  const minimumEndAt = useMemo(() => {
    if (!isEndPicker || !isValidDate(selectedStartAt)) {
      return null;
    }

    return new Date(
      selectedStartAt.getTime() + MIN_BOOKING_MINUTES * 60 * 1000,
    );
  }, [isEndPicker, selectedStartAt]);

  /* ------------------------------------------------------------------------ */
  /* SYNC DRAFT WHEN OPENING                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isValidDate(selectedDate)) {
      setDraftDay(startOfDay(selectedDate));
      setDraftDate(selectedDate);

      return;
    }

    /*
     * START PICKER
     *
     * No committed value yet.
     * Do not automatically create 12:00 AM.
     */
    if (isStartPicker) {
      setDraftDay(null);
      setDraftDate(null);

      return;
    }

    /*
     * END PICKER
     *
     * If there is no committed End yet,
     * default the calendar to the earliest possible
     * End day, but do not commit anything.
     */
    if (isEndPicker && isValidDate(minimumEndAt)) {
      setDraftDay(startOfDay(minimumEndAt));
      setDraftDate(null);

      return;
    }

    setDraftDay(null);
    setDraftDate(null);
  }, [open, selectedDate, isStartPicker, isEndPicker, minimumEndAt]);

  /* ------------------------------------------------------------------------ */
  /* REQUEST HELPERS                                                          */
  /* ------------------------------------------------------------------------ */

  const getReservedSchedules = async (selectedDay) => {
    if (!isStartPicker || !venueId || !isValidDate(selectedDay)) {
      return [];
    }

    const payload = {
      venueId,
      date: formatDateForQuery(selectedDay),
    };

    if (excludeBookingId) {
      payload.excludeBookingId = excludeBookingId;
    }

    try {
      const response = await dispatch(GET_RESERVED_SCHEDULES(payload)).unwrap();

      return response?.data || [];
    } catch {
      return [];
    }
  };

  const getAvailableUntil = async (selectedStart) => {
    if (!venueId || !isValidDate(selectedStart)) {
      return null;
    }

    const payload = {
      venueId,
      startAt: selectedStart.toISOString(),
    };

    if (excludeBookingId) {
      payload.excludeBookingId = excludeBookingId;
    }

    try {
      const response = await dispatch(GET_AVAILABLE_UNTIL(payload)).unwrap();

      return response?.data?.availableUntil ?? null;
    } catch {
      return null;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* START PICKER OPEN                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open || !isStartPicker || !venueId || !isValidDate(selectedDate)) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const selectedDay = startOfDay(selectedDate);

      const schedules = await getReservedSchedules(selectedDay);

      if (cancelled) {
        return;
      }

      /*
       * Keep existing selected time if it is still valid.
       */
      const selectedStillValid =
        selectedDate >= new Date() &&
        !hasStartConflict(selectedDate, schedules);

      if (selectedStillValid) {
        setDraftDay(selectedDay);
        setDraftDate(selectedDate);

        return;
      }

      /*
       * Otherwise automatically move to the
       * earliest available Start Time.
       */
      const firstAvailable = getFirstAvailableStartTime(selectedDay, schedules);

      setDraftDay(selectedDay);
      setDraftDate(firstAvailable);
    };

    load();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isStartPicker, venueId]);

  /* ------------------------------------------------------------------------ */
  /* END PICKER OPEN                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open || !isEndPicker || !venueId || !isValidDate(selectedStartAt)) {
      return;
    }

    /*
     * If validUntil has no value, request it again
     * when the End picker opens.
     */
    if (!validUntil) {
      getAvailableUntil(selectedStartAt);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEndPicker, venueId, validUntil]);

  /* ------------------------------------------------------------------------ */
  /* AVAILABLE START TIMES                                                    */
  /* ------------------------------------------------------------------------ */

  const availableStartRanges = useMemo(() => {
    if (!isStartPicker || !isValidDate(draftDay)) {
      return [];
    }

    return getAvailableStartRanges(draftDay, reservedSchedules);
  }, [isStartPicker, draftDay, reservedSchedules]);

  /* ------------------------------------------------------------------------ */
  /* START TIME DISABLED                                                      */
  /* ------------------------------------------------------------------------ */

  const isStartTimeDisabled = (time) => {
    if (!isValidDate(draftDay) || isLoading) {
      return true;
    }

    const candidateStart = mergeTime(draftDay, time);

    if (!isValidDate(candidateStart)) {
      return true;
    }

    /*
     * Past times cannot be selected.
     */
    if (candidateStart < new Date()) {
      return true;
    }

    return hasStartConflict(candidateStart, reservedSchedules);
  };

  /* ------------------------------------------------------------------------ */
  /* END TIME DISABLED                                                        */
  /* ------------------------------------------------------------------------ */

  const isEndTimeDisabled = (time) => {
    if (
      !isValidDate(draftDay) ||
      !isValidDate(selectedStartAt) ||
      !isValidDate(minimumEndAt)
    ) {
      return true;
    }

    const candidateEnd = mergeTime(draftDay, time);

    if (!isValidDate(candidateEnd)) {
      return true;
    }

    /*
     * Must satisfy the minimum duration.
     */
    if (candidateEnd < minimumEndAt) {
      return true;
    }

    /*
     * Ending exactly at availableUntil is allowed.
     */
    if (isValidDate(availableUntil) && candidateEnd > availableUntil) {
      return true;
    }

    return false;
  };

  /* ------------------------------------------------------------------------ */
  /* TIME DISABLED                                                            */
  /* ------------------------------------------------------------------------ */

  const isTimeDisabled = (time) => {
    if (isStartPicker) {
      return isStartTimeDisabled(time);
    }

    return isEndTimeDisabled(time);
  };

  /* ------------------------------------------------------------------------ */
  /* FIRST AVAILABLE END TIME                                                 */
  /* ------------------------------------------------------------------------ */

  const getFirstAvailableEndTime = (selectedDay) => {
    if (!isValidDate(selectedDay) || !isValidDate(minimumEndAt)) {
      return null;
    }

    const dayStart = startOfDay(selectedDay);
    const dayEnd = startOfNextDay(selectedDay);

    /*
     * Earliest candidate:
     *
     * - If minimumEndAt falls on this day,
     *   begin from minimumEndAt.
     *
     * - If this is a later day,
     *   begin from 12:00 AM.
     */
    let candidate = isSameDay(selectedDay, minimumEndAt)
      ? new Date(minimumEndAt)
      : new Date(dayStart);

    candidate.setSeconds(0, 0);

    /*
     * Defensive rounding to the next 15-minute slot.
     */
    const minutes = candidate.getMinutes();
    const remainder = minutes % TIME_STEP_MINUTES;

    if (remainder !== 0) {
      candidate.setMinutes(minutes + (TIME_STEP_MINUTES - remainder), 0, 0);
    }

    while (candidate < dayEnd) {
      if (!isValidDate(availableUntil) || candidate <= availableUntil) {
        return candidate;
      }

      return null;
    }

    return null;
  };

  /* ------------------------------------------------------------------------ */
  /* DATE DISABLED                                                            */
  /* ------------------------------------------------------------------------ */

  const isDateDisabled = (candidateDate) => {
    if (!isValidDate(candidateDate)) {
      return true;
    }

    const candidateDay = startOfDay(candidateDate);

    /*
     * START DATE
     *
     * Disable past calendar dates.
     * Today itself remains selectable.
     */
    if (isStartPicker) {
      const today = startOfDay(new Date());

      return candidateDay < today;
    }

    /*
     * END DATE
     */
    if (!isValidDate(selectedStartAt) || !isValidDate(minimumEndAt)) {
      return true;
    }

    /*
     * The earliest End Date is based on
     * startAt + minimum duration.
     */
    const minimumEndDay = startOfDay(minimumEndAt);

    if (candidateDay < minimumEndDay) {
      return true;
    }

    /*
     * If another booking exists,
     * End Date cannot go beyond its Start Date.
     */
    if (isValidDate(availableUntil)) {
      const availableUntilDay = startOfDay(availableUntil);

      if (candidateDay > availableUntilDay) {
        return true;
      }
    }

    return false;
  };

  /* ------------------------------------------------------------------------ */
  /* AVAILABLE START RANGE DISPLAY                                            */
  /* ------------------------------------------------------------------------ */

  const isAvailableAllDay = useMemo(() => {
    if (
      !isStartPicker ||
      !isValidDate(draftDay) ||
      availableStartRanges.length !== 1
    ) {
      return false;
    }

    /*
     * Today cannot be "Available all day"
     * once part of the day has already passed.
     */
    if (isSameDay(draftDay, new Date())) {
      return false;
    }

    const [range] = availableStartRanges;

    const firstSlot = startOfDay(draftDay);

    const lastSlot = new Date(startOfNextDay(draftDay));

    lastSlot.setMinutes(lastSlot.getMinutes() - TIME_STEP_MINUTES);

    return (
      range.start.getTime() === firstSlot.getTime() &&
      range.end.getTime() === lastSlot.getTime()
    );
  }, [isStartPicker, draftDay, availableStartRanges]);

  const availableRangesPreview = useMemo(() => {
    if (!isStartPicker || isAvailableAllDay) {
      return [];
    }

    return availableStartRanges.map(({ start, end }) => {
      const startLabel = formatTime(start);
      const endLabel = formatTime(end);

      if (start.getTime() === end.getTime()) {
        return startLabel;
      }

      return `${startLabel} - ${endLabel}`;
    });
  }, [isStartPicker, isAvailableAllDay, availableStartRanges]);

  /* ------------------------------------------------------------------------ */
  /* CUSTOMER-FRIENDLY AVAILABILITY MESSAGE                                   */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /* CUSTOMER-FRIENDLY AVAILABILITY MESSAGE                                   */
  /* ------------------------------------------------------------------------ */

  const availabilityText = useMemo(() => {
    /*
     * START
     */
    if (isStartPicker) {
      if (!isValidDate(draftDay)) {
        return "Select a date to see available times.";
      }

      if (isLoading) {
        return "Checking available times...";
      }

      if (!availableStartRanges.length) {
        return "No available times on this date.";
      }

      if (isAvailableAllDay) {
        return "Available all day.";
      }

      return "";
    }

    /*
     * END
     */
    if (!isValidDate(selectedStartAt)) {
      return "Select a start date and time first.";
    }

    if (isLoading) {
      return "Checking available times...";
    }

    if (!isValidDate(draftDay)) {
      return "Select an end date to see available times.";
    }

    /*
     * Earliest valid End Time for the currently
     * selected End Date.
     *
     * Same day as minimumEndAt:
     *   Use minimumEndAt.
     *
     * Later day:
     *   Start from 12:00 AM.
     */
    const earliestEnd = isSameDay(draftDay, minimumEndAt)
      ? minimumEndAt
      : startOfDay(draftDay);

    /*
     * The next booking starts on the selected End Date,
     * so we know both the earliest and latest End Time.
     */
    if (isValidDate(availableUntil) && isSameDay(draftDay, availableUntil)) {
      /*
       * No valid End Time.
       */
      if (earliestEnd > availableUntil) {
        return "No available times on this date.";
      }

      /*
       * Exactly one valid End Time.
       *
       * Example:
       * 7:00 AM only
       */
      if (earliestEnd.getTime() === availableUntil.getTime()) {
        return `${formatTime(earliestEnd)} only`;
      }

      /*
       * Multiple valid End Times.
       *
       * Example:
       * 3:30 AM – 7:00 AM
       */
      return `${formatTime(earliestEnd)} – ${formatTime(availableUntil)}`;
    }

    /*
     * The next booking is on a later date,
     * or there is currently no later booking
     * limiting this selected End Date.
     *
     * Example:
     * 1:00 AM onward
     */
    return `${formatTime(earliestEnd)} onward`;
  }, [
    isStartPicker,
    draftDay,
    isLoading,
    availableStartRanges,
    isAvailableAllDay,
    selectedStartAt,
    minimumEndAt,
    availableUntil,
  ]);
  /* ------------------------------------------------------------------------ */
  /* CALENDAR SELECT                                                          */
  /* ------------------------------------------------------------------------ */

  const handleDateSelect = async (selectedCalendarDate) => {
    if (!selectedCalendarDate) {
      return;
    }

    const selectedDay = startOfDay(selectedCalendarDate);

    /*
     * Immediately show the selected calendar day.
     */
    setDraftDay(selectedDay);

    /* ---------------------------------------------------------------------- */
    /* START                                                                  */
    /* ---------------------------------------------------------------------- */

    if (isStartPicker) {
      /*
       * Clear old time while checking the
       * newly selected date.
       *
       * This prevents 12:00 AM or the previous
       * day's time from appearing as the default.
       */
      setDraftDate(null);

      const schedules = await getReservedSchedules(selectedDay);

      const firstAvailable = getFirstAvailableStartTime(selectedDay, schedules);

      /*
       * If no available time exists:
       *
       * draftDay  = selected calendar date
       * draftDate = null
       *
       * Therefore Confirm Time stays disabled.
       */
      setDraftDate(firstAvailable);

      onPreviewDate(firstAvailable);

      if (!withTime && firstAvailable) {
        setDate(firstAvailable);
        setOpen(false);
      }

      return;
    }

    /* ---------------------------------------------------------------------- */
    /* END                                                                    */
    /* ---------------------------------------------------------------------- */

    if (isEndPicker) {
      const firstAvailableEnd = getFirstAvailableEndTime(selectedDay);

      /*
       * Same behavior:
       *
       * If no valid End Time exists,
       * keep the selected calendar day but
       * do not select a time.
       */
      setDraftDate(firstAvailableEnd);

      onPreviewDate(firstAvailableEnd);

      if (!withTime && firstAvailableEnd) {
        setDate(firstAvailableEnd);
        setOpen(false);
      }
    }
  };

  /* ------------------------------------------------------------------------ */
  /* TIME CHANGE                                                              */
  /* ------------------------------------------------------------------------ */

  const handleTimeChange = (next) => {
    if (!next || !isValidDate(draftDay)) {
      return;
    }

    const nextDateTime = mergeTime(draftDay, next);

    if (!isValidDate(nextDateTime)) {
      return;
    }

    if (isTimeDisabled(next)) {
      return;
    }

    setDraftDate(nextDateTime);

    onPreviewDate(nextDateTime);
  };

  /* ------------------------------------------------------------------------ */
  /* CONFIRM                                                                  */
  /* ------------------------------------------------------------------------ */

  const confirmSelection = () => {
    if (!isValidDate(draftDate) || isLoading) {
      return;
    }

    if (isTimeDisabled(toTimeValue(draftDate))) {
      return;
    }

    setDate(draftDate);

    /*
     * Once Start is confirmed, immediately get
     * the next booking boundary for End.
     */
    if (isStartPicker && venueId) {
      getAvailableUntil(draftDate);
    }

    setOpen(false);
  };

  /* ------------------------------------------------------------------------ */
  /* PICKER DISABLED                                                          */
  /* ------------------------------------------------------------------------ */

  const pickerDisabled =
    props.disabled || (isEndPicker && !isValidDate(selectedStartAt));

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="relative">
      {required && (
        <input
          type="text"
          value={selectedDate?.toISOString() || ""}
          onChange={() => {}}
          required
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
            {...props}
            disabled={pickerDisabled}
          >
            <CalendarIcon className="size-4" />

            {withTime ? formatDateTime(selectedDate) : formatDate(selectedDate)}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto max-w-[calc(100vw-1.5rem)] overflow-x-auto overflow-y-hidden p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          align={align}
          collisionPadding={12}
        >
          <div className="w-fit min-w-max max-w-[calc(100vw-1.5rem)]">
            <div className="flex items-start">
              <Calendar
                mode="single"
                /*
                 * Calendar uses draftDay instead of
                 * draftDate so the selected date remains
                 * highlighted even when there is no
                 * available time.
                 */
                required
                selected={draftDay}
                disabled={isDateDisabled}
                onSelect={handleDateSelect}
                classNames={{
                  today: "[&_button]:bg-transparent [&_button]:text-foreground",
                }}
              />

              {withTime && (
                <div className="flex items-stretch justify-center self-stretch border-s px-3 sm:px-4">
                  <TimePicker
                    aria-label={isStartPicker ? "Start time" : "End time"}
                    /*
                     * No valid/default time:
                     * send an empty value.
                     */
                    value={isValidDate(draftDate) ? toTimeValue(draftDate) : ""}
                    onValueChange={handleTimeChange}
                    isTimeDisabled={isTimeDisabled}
                    disabled={!isValidDate(draftDay) || isLoading}
                    minuteStep={TIME_STEP_MINUTES}
                    hourCycle={12}
                  >
                    <TimePickerPanel className="h-full [--time-picker-rows:7] max-sm:[--time-picker-option-height:calc(var(--spacing)*6)]">
                      <TimePickerColumns className="h-full [&_[data-slot=time-picker-column]]:h-full max-sm:[&_[data-slot=time-picker-column-label]]:px-1 max-sm:[&_[data-slot=time-picker-column-label]]:text-[0.7rem] max-sm:[&_[data-slot=time-picker-column-list]]:px-1 max-sm:[&_[data-slot=time-picker-column]]:min-w-11 max-sm:[&_[data-slot=time-picker-option]]:text-xs" />
                    </TimePickerPanel>
                  </TimePicker>
                </div>
              )}
            </div>

            {withTime && (
              <div className="w-0 min-w-full border-t bg-background px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {isLoading ? (
                        <Loader2 className="size-3.5 shrink-0 animate-spin" />
                      ) : (
                        <Clock3 className="size-3.5 shrink-0" />
                      )}

                      <p className="text-[11px] font-medium uppercase tracking-wide">
                        {isStartPicker
                          ? "Available start times"
                          : "Available end time"}
                      </p>
                    </div>

                    {availabilityText && (
                      <p className="max-w-80 whitespace-normal text-xs font-medium leading-relaxed text-foreground">
                        {availabilityText}
                      </p>
                    )}

                    {isStartPicker &&
                      !!availableRangesPreview.length &&
                      !isLoading && (
                        <div className="grid max-w-full grid-cols-[max-content_max-content] gap-1.5">
                          {availableRangesPreview.map((range, index) => (
                            <span
                              key={`${range}-${index}`}
                              className="max-w-32 truncate rounded-md border bg-muted/40 px-2 py-1 text-[11px] font-medium leading-none"
                            >
                              {range}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      !isValidDate(draftDate) ||
                      isLoading ||
                      isTimeDisabled(toTimeValue(draftDate))
                    }
                    className="h-8 shrink-0 gap-1.5 px-3 text-xs"
                    onClick={confirmSelection}
                  >
                    <Check className="size-3.5" />
                    Confirm Time
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
