import { GET_SALES_REPORT } from "@/services/redux/slices/report/booking";
import { endOfMonth, isValid, startOfMonth, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Loader2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, fullName, handlePagination } from "@/services/utilities";
import Approval from "../../../events/bookings/schedule/approval";
import Summary from "./summary";
import CustomPagination from "@/components/shared/pagination";
import DatePicker from "@/components/shared/datePicker";
import { STATUS_STYLES } from "../../../events/bookings/constant";
import { cn } from "cn";

const getCustomerName = (customer) =>
  customer?.fullName
    ? typeof customer.fullName === "string"
      ? customer.fullName
      : fullName(customer.fullName)
    : "Unknown customer";

const formatDate = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  if (!isValid(parsed)) return "—";

  return format(parsed, "MMM dd, yyyy");
};

const getServiceLabel = (booking) => {
  const hasCatering = Boolean(booking?.catering?.schedule?.startAt);

  const hasVenue = Boolean(booking?.venue?.schedule?.startAt);

  if (hasCatering && hasVenue) {
    return "Catering + Venue";
  }

  if (hasCatering) return "Catering";
  if (hasVenue) return "Venue";

  const type = booking?.type;

  if (Array.isArray(type)) {
    return type.join(" + ") || "—";
  }

  return type || "—";
};

const getScheduleLabel = (booking) => {
  const cateringStart = booking?.catering?.schedule?.startAt;

  const venueStart = booking?.venue?.schedule?.startAt;

  if (cateringStart && venueStart) {
    return "Multiple schedules";
  }

  return formatDate(cateringStart || venueStart);
};

const BookingSalesReport = () => {
  const dispatch = useDispatch();

  const { salesReport, isLoading } = useSelector(
    ({ bookingReport }) => bookingReport,
  );

  const { bookings = [] } = salesReport || {};

  const [date, setDate] = useState(() => {
    const today = new Date();

    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const startDate = isValid(date?.from) ? format(date.from, "yyyy-MM-dd") : "";

  const endDate = isValid(date?.to) ? format(date.to, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (!startDate || !endDate || startDate > endDate) return;
    setPage(1);

    dispatch(
      GET_SALES_REPORT({
        startDate,
        endDate,
      }),
    );
  }, [dispatch, startDate, endDate]);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const reference = String(booking?.reference || "").toLowerCase();

      const customer = getCustomerName(booking?.customer).toLowerCase();

      const matchesSearch =
        !keyword || reference.includes(keyword) || customer.includes(keyword);

      const matchesStatus = status === "all" || booking?.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, status]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Card className="border-border shadow-sm">
          <CardHeader className="gap-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-2xl text-foreground">
                Booking Sales Report
              </CardTitle>

              <CardDescription>
                Monitor booking sales, verified payments, and outstanding
                balances.
              </CardDescription>
            </div>

            <div
              className="min-w-0 space-y-1.5 sm:ml-auto sm:shrink-0"
              role="group"
              aria-labelledby="sales-report-date-range-label"
            >
              <p
                id="sales-report-date-range-label"
                className="text-xs font-medium text-muted-foreground"
              >
                Report Period
              </p>
              <DatePicker
                mode="range"
                date={date}
                setDate={setDate}
                highlightToday={false}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6" aria-busy={isLoading}>
            <Summary />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />

                <Input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search booking reference or customer"
                  placeholder="Reference or customer…"
                  className="pl-9"
                />
              </div>

              <Select value={status} onValueChange={handleStatus}>
                <SelectTrigger
                  aria-label="Booking status"
                  className="w-full sm:w-[150px]"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>

                  <SelectItem value="confirmed">Confirmed</SelectItem>

                  <SelectItem value="setup">Setup</SelectItem>

                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="min-w-[180px]">
                      Booking / Customer
                    </TableHead>

                    <TableHead className="min-w-[165px]">
                      Service / Schedule
                    </TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">Booking Value</TableHead>

                    <TableHead className="text-right">Paid</TableHead>

                    <TableHead className="text-right">Balance</TableHead>

                    <TableHead className="w-16 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading || filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div
                          role="status"
                          className="flex items-center justify-center gap-2"
                        >
                          {isLoading && (
                            <Loader2 className="size-4 animate-spin" />
                          )}
                          {isLoading
                            ? "Loading bookings…"
                            : bookings.length === 0
                              ? "No booking records found for this period."
                              : "No bookings match your search or status filter."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    handlePagination(filteredBookings, page, maxPage).map(
                      (booking) => {
                        const bookingValue = Number(
                          booking?.pricing?.total ?? booking?.totalAmount ?? 0,
                        );

                        return (
                          <TableRow key={booking._id}>
                            <TableCell className="py-3 text-xs">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {booking?.reference || "—"}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {getCustomerName(booking?.customer)}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="py-3 text-xs">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {getServiceLabel(booking)}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {getScheduleLabel(booking)}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize",
                                  STATUS_STYLES[booking?.status],
                                )}
                              >
                                {booking?.status || "pending"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right text-sm font-medium tabular-nums">
                              {Formatter.amount(bookingValue)}
                            </TableCell>

                            <TableCell className="text-right text-sm tabular-nums">
                              {Formatter.amount(booking?.totalPaid)}
                            </TableCell>

                            <TableCell className="text-right text-sm font-semibold tabular-nums">
                              {Formatter.amount(booking?.outstandingBalance)}
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                title="View Booking Details"
                                aria-label="View Booking Details"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {!isLoading && (
              <CustomPagination
                page={page}
                maxPage={maxPage}
                datas={filteredBookings}
                title="booking"
                setPage={setPage}
                setMaxPage={(value) => {
                  setMaxPage(value);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Read-only Booking Details */}
      <Approval
        mode="view"
        selected={selectedBooking}
        isOpen={Boolean(selectedBooking?._id)}
        setIsOpen={(open) => {
          if (!open) setSelectedBooking(null);
        }}
        isReport={true}
      />
    </div>
  );
};

export default BookingSalesReport;
