import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/shared/datePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Header = ({
  data,
  customDate,
  period,
  handlePeriodChange,
  handleCustomDateChange,
}) => {
  return (
    <header className="flex flex-col justify-between gap-4 pb-1 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary">
          <ChartNoAxesCombined className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
            Business Overview
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Monitor collections, bookings, and daily operations.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger
            aria-label={`Reporting period: ${data.label}`}
            className="h-10 min-w-0 flex-1 gap-3 rounded-lg bg-card px-3 text-xs shadow-sm sm:w-[225px] sm:flex-none"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <CalendarDays
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <SelectValue>
                {period === "custom" ? "Custom Date Range" : data.label}
              </SelectValue>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>
        {period === "custom" && (
          <div
            role="group"
            aria-label="Custom dashboard date range"
            className="[&_button]:h-10 [&_button]:rounded-lg [&_button]:text-xs"
          >
            <DatePicker
              mode="range"
              date={customDate}
              setDate={handleCustomDateChange}
              highlightToday={false}
            />
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 shrink-0 gap-2 rounded-lg bg-card px-3 text-xs shadow-sm"
            >
              <ReceiptText
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Reports
              <ChevronDown
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">Booking</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/platforms/reports/booking/sales">Sales Report</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/platforms/reports/booking/payments">
                Payments Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">POS</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/platforms/reports/pos/sales">Sales Report</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/platforms/reports/pos/transactions">
                Transactions Report
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
