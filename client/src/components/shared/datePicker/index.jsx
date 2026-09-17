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
      <PopoverContent className="w-auto overflow-hidden p-0" align="end">
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
        {withTime && (
          <div className="space-y-2 border-t px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Clock3 className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight text-foreground">
                  Time
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  Set the exact schedule
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={toTimeValue(date)}
                onChange={(event) => {
                  setDate(mergeTime(date, event.target.value));
                }}
                className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 text-sm tabular-nums text-foreground shadow-xs outline-none transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              />
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 px-3"
                onClick={() => setOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
