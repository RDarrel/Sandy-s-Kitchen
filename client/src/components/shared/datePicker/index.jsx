import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock3 } from "lucide-react";
import {
  TimePicker,
  TimePickerColumns,
  TimePickerPanel,
} from "@/components/reui/time-picker";

const formatDate = (date) =>
  date
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date";

const formatDateTime = (date) =>
  date
    ? date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Select date and time";

const toTimeValue = (date) => {
  if (!date) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const mergeDateAndTime = (nextDate, currentDate) => {
  const source = currentDate || new Date();
  const merged = new Date(nextDate);

  merged.setHours(source.getHours(), source.getMinutes(), 0, 0);

  return merged;
};

const mergeTime = (currentDate, time) => {
  const [hours = "0", minutes = "0"] = String(time || "").split(":");
  const merged = new Date(currentDate || new Date());

  merged.setHours(Number(hours), Number(minutes), 0, 0);

  return merged;
};

const DatePicker = ({
  date = new Date(),
  setDate = () => {},
  withTime = false,
  align = "end",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal ",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {withTime ? formatDateTime(date) : formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align={align}>
        <div className="flex items-center  sm:flex-row sm:items-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (!selectedDate) return;
              setDate(
                withTime ? mergeDateAndTime(selectedDate, date) : selectedDate,
              );
              if (!withTime) setOpen(false);
            }}
          />
          <div className="flex justify-center self-stretch max-sm:border-t max-sm:pt-4 sm:border-s sm:ps-4 mr-5">
            <TimePicker
              aria-label="Publish time"
              // value={time}
              onValueChange={(next) => {
                /* No footer means no Clear, so `next` is never null here. */
                if (next) setTime(next);
              }}
              minuteStep={15}
              hourCycle={12}
            >
              <TimePickerPanel className="[--time-picker-rows:7]">
                {/* No footer: Now would set the time but not the date. */}
                <TimePickerColumns />
              </TimePickerPanel>
            </TimePicker>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
