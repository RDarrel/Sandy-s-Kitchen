import { useMemo, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Search,
  TrendingUp,
  Wallet,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// -----------------------------------
// FAKE DATA
// -----------------------------------

const bookings = [
  {
    id: "BK-2026-001",
    customer: "Maria Santos",
    service: "Catering",
    eventDate: "2026-10-25",
    total: 25000,
    paid: 10000,
    status: "confirmed",
  },
  {
    id: "BK-2026-002",
    customer: "John Reyes",
    service: "Venue",
    eventDate: "2026-10-28",
    total: 15000,
    paid: 15000,
    status: "confirmed",
  },
  {
    id: "BK-2026-003",
    customer: "Angela Cruz",
    service: "Catering + Venue",
    eventDate: "2026-11-02",
    total: 45000,
    paid: 20000,
    status: "confirmed",
  },
  {
    id: "BK-2026-004",
    customer: "Mark Dela Rosa",
    service: "Catering",
    eventDate: "2026-11-05",
    total: 30000,
    paid: 30000,
    status: "completed",
  },
  {
    id: "BK-2026-005",
    customer: "Patricia Lim",
    service: "Venue",
    eventDate: "2026-11-10",
    total: 18000,
    paid: 5000,
    status: "approved",
  },
  {
    id: "BK-2026-006",
    customer: "Daniel Garcia",
    service: "Catering + Venue",
    eventDate: "2026-11-15",
    total: 60000,
    paid: 30000,
    status: "confirmed",
  },
  {
    id: "BK-2026-007",
    customer: "Sophia Mendoza",
    service: "Catering",
    eventDate: "2026-11-20",
    total: 22000,
    paid: 22000,
    status: "completed",
  },
  {
    id: "BK-2026-008",
    customer: "Carlo Bautista",
    service: "Venue",
    eventDate: "2026-11-22",
    total: 12000,
    paid: 0,
    status: "approved",
  },
];

const peso = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getPaymentStatus = (booking) => {
  if (booking.paid >= booking.total) return "Paid";
  if (booking.paid > 0) return "Partial";
  return "Unpaid";
};

const paymentBadge = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid: "bg-slate-100 text-slate-700 border-slate-200",
};

const PAGE_SIZE = 5;

const BookingRevenue = () => {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(search.toLowerCase()) ||
        booking.customer.toLowerCase().includes(search.toLowerCase());

      const matchesService =
        serviceFilter === "all" || booking.service === serviceFilter;

      const matchesPayment =
        paymentFilter === "all" || getPaymentStatus(booking) === paymentFilter;

      return matchesSearch && matchesService && matchesPayment;
    });
  }, [search, serviceFilter, paymentFilter]);

  const summary = useMemo(() => {
    return filteredBookings.reduce(
      (acc, booking) => {
        acc.totalValue += booking.total;
        acc.collected += booking.paid;
        acc.outstanding += Math.max(0, booking.total - booking.paid);
        acc.count += 1;
        return acc;
      },
      {
        totalValue: 0,
        collected: 0,
        outstanding: 0,
        count: 0,
      },
    );
  }, [filteredBookings]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBookings.length / PAGE_SIZE),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleView = (booking) => {
    // Replace with your existing Booking Details modal.
    console.log("View booking:", booking);
  };

  const summaryCards = [
    {
      title: "Total Booking Value",
      value: peso(summary.totalValue),
      description: "Value of listed bookings",
      icon: TrendingUp,
    },
    {
      title: "Payments Collected",
      value: peso(summary.collected),
      description: "Recorded booking payments",
      icon: Wallet,
    },
    {
      title: "Outstanding Balance",
      value: peso(summary.outstanding),
      description: "Remaining unpaid amount",
      icon: CreditCard,
    },
    {
      title: "Total Bookings",
      value: summary.count,
      description: "Bookings matching filters",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl text-foreground">
                  Booking Revenue
                </CardTitle>
                <CardDescription className="mt-1">
                  Track catering and venue booking values, payments, and
                  outstanding balances.
                </CardDescription>
              </div>

              <Badge variant="outline" className="w-fit">
                <FileText className="mr-1.5 size-3.5" />
                Sample Data
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* SUMMARY CARDS */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        {card.title}
                      </p>

                      <div className="rounded-lg bg-muted p-2">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                    </div>

                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {card.value}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* FILTERS */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search booking or customer..."
                  className="pl-9"
                />
              </div>

              <Select
                value={serviceFilter}
                onValueChange={(value) => {
                  setServiceFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Catering">Catering</SelectItem>
                  <SelectItem value="Venue">Venue</SelectItem>
                  <SelectItem value="Catering + Venue">
                    Catering + Venue
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={paymentFilter}
                onValueChange={(value) => {
                  setPaymentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[170px]">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BOOKINGS TABLE */}
            <div className="overflow-hidden rounded-xl border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedBookings.length > 0 ? (
                      paginatedBookings.map((booking) => {
                        const balance = Math.max(
                          0,
                          booking.total - booking.paid,
                        );

                        const paymentStatus = getPaymentStatus(booking);

                        return (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{booking.id}</p>
                                <p className="text-xs text-muted-foreground">
                                  {booking.customer}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>{booking.service}</TableCell>

                            <TableCell className="whitespace-nowrap">
                              {formatDate(booking.eventDate)}
                            </TableCell>

                            <TableCell className="text-right font-medium">
                              {peso(booking.total)}
                            </TableCell>

                            <TableCell className="text-right">
                              {peso(booking.paid)}
                            </TableCell>

                            <TableCell className="text-right">
                              {peso(balance)}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={paymentBadge[paymentStatus]}
                              >
                                {paymentStatus}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View booking"
                                onClick={() => handleView(booking)}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                {filteredBookings.length === 0
                  ? 0
                  : (currentPage - 1) * PAGE_SIZE + 1}
                –{Math.min(currentPage * PAGE_SIZE, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <span className="px-2 text-sm">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingRevenue;
