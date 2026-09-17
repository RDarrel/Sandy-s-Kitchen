import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn("relative bg-background p-3", className)}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex flex-col gap-6 sm:flex-row", defaultClassNames.months),
        month: cn("space-y-3", defaultClassNames.month),
        month_caption: cn(
          "flex h-7 items-center justify-center px-8",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-sm font-medium",
          captionLayout !== "label" &&
            "flex h-8 items-center gap-1 rounded-md px-2 [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "absolute inset-x-3 top-3 z-20 flex items-center justify-between pointer-events-none",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-80 shadow-none hover:bg-accent hover:opacity-100",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-80 shadow-none hover:bg-accent hover:opacity-100",
          defaultClassNames.button_next
        ),
        dropdowns: cn(
          "flex h-9 items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input bg-background shadow-xs",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 cursor-pointer opacity-0",
          defaultClassNames.dropdown
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-7 rounded-md text-[0.75rem] font-normal text-muted-foreground",
          defaultClassNames.weekday
        ),
        week: cn("mt-1.5 flex w-full", defaultClassNames.week),
        day: cn(
          "relative h-7 w-7 p-0 text-center",
          "[&:has([data-range-start=true])]:rounded-l-md [&:has([data-range-start=true])]:bg-accent",
          "[&:has([data-range-end=true])]:rounded-r-md [&:has([data-range-end=true])]:bg-accent",
          "[&:has([data-range-middle=true])]:bg-accent",
          "[&:first-child:has([data-range-middle=true])]:rounded-l-md",
          "[&:last-child:has([data-range-middle=true])]:rounded-r-md",
          defaultClassNames.day
        ),
        day_button: cn(
          "h-7 w-7 p-0 font-normal aria-selected:opacity-100",
          defaultClassNames.day_button
        ),
        range_start: cn(defaultClassNames.range_start),
        range_middle: cn(defaultClassNames.range_middle),
        range_end: cn(defaultClassNames.range_end),
        selected: cn(defaultClassNames.selected),
        today: cn(
          "[&_button]:bg-accent [&_button]:text-accent-foreground",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground opacity-50 aria-selected:opacity-30",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        week_number_header: cn("w-7", defaultClassNames.week_number_header),
        week_number: cn(
          "text-[0.8rem] text-muted-foreground",
          defaultClassNames.week_number
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("h-4 w-4", className)} {...props} />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("h-4 w-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("h-4 w-4", className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex h-7 w-7 items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "h-7 w-7 rounded-md p-0 text-sm font-normal",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:hover:bg-transparent",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        defaultClassNames.day_button,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
