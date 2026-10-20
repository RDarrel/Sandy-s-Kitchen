import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Boxes,
  CalendarDays,
  ChartColumn,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Clock3,
  PhilippinePeso,
  ReceiptText,
  ShoppingBag,
  Truck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DatePicker from "@/components/shared/datePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { capitalize, Formatter, Stock } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import {
  GET_COLLECTIONS, GET_INCOMING_DELIVERIES, GET_INVENTORY_OVERVIEW,
  GET_SUMMARY, GET_TOP_SELLING_ITEMS, GET_UPCOMING_BOOKINGS,
} from "@/services/redux/slices/dashboard";
import { buildCollectionSeries, getCollectionRange, getCustomDateRange, getPeriodRange, mapBooking, mapDelivery, mapInventoryItem } from "./data";
import { IncomingDeliveriesSkeleton, InventoryOverviewSkeleton, TopSellingItemsSkeleton, UpcomingBookingsSkeleton } from "./skeletons";

const chartConfig = {
  booking: { label: "Booking", color: "var(--primary)" },
  pos: { label: "POS", color: "var(--chart-3)" },
};
const money = (value) => Formatter.amount(value);

const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  const [revenueFrequency, setRevenueFrequency] = useState("week");
  const [now] = useState(() => new Date());
  const [customDate, setCustomDate] = useState(() => {
    const initialRange = getPeriodRange("month", now);
    return { from: initialRange.start, to: initialRange.end };
  });
  const [customRange, setCustomRange] = useState(() => getCustomDateRange(customDate));
  const dispatch = useDispatch();
  const {
    summary, collections, topSellingItems, upcomingBookings: bookingReport,
    inventoryOverview, incomingDeliveries: deliveryReport, errors = {}, requestIds = {},
    isLoadingSummary: loadingSummary, isLoadingCollections: loadingCollections,
    isLoadingTopSelling: loadingTopSelling, isLoadingUpcomingBookings: loadingBookings,
    isLoadingInventoryOverview: loadingInventory, isLoadingIncomingDeliveries: loadingDeliveries,
  } = useSelector((state) => state.dashboard);
  const isLoadingSummary = !requestIds.summary || loadingSummary;
  const isLoadingCollections = !requestIds.collections || loadingCollections;
  const isLoadingTopSelling = !requestIds.topSellingItems || loadingTopSelling;
  const isLoadingBookings = !requestIds.upcomingBookings || loadingBookings;
  const isLoadingInventory = !requestIds.inventoryOverview || loadingInventory;
  const isLoadingDeliveries = !requestIds.incomingDeliveries || loadingDeliveries;
  const range = useMemo(() => period === "custom" ? customRange : getPeriodRange(period, now), [period, customRange, now]);
  const revenueRange = useMemo(() => getCollectionRange(range, revenueFrequency), [range, revenueFrequency]);
  const { startDate, endDate } = range;
  const { frequency } = revenueRange;

  const handlePeriodChange = (value) => {
    if (value === "custom") {
      const nextDate = { from: range.start, to: range.end };
      setCustomDate(nextDate);
      setCustomRange(getCustomDateRange(nextDate));
    }
    setPeriod(value);
  };

  const handleCustomDateChange = (nextDate) => {
    setCustomDate(nextDate);
    const nextRange = getCustomDateRange(nextDate);
    if (nextRange) setCustomRange(nextRange);
  };

  useEffect(() => {
    const requests = [
      dispatch(GET_SUMMARY({ startDate, endDate })),
      dispatch(GET_TOP_SELLING_ITEMS({ startDate, endDate })),
    ];
    return () => requests.forEach((request) => request.abort());
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    const request = dispatch(GET_COLLECTIONS({ startDate, endDate, frequency }));
    return () => request.abort();
  }, [dispatch, startDate, endDate, frequency]);

  useEffect(() => {
    const requests = [
      dispatch(GET_UPCOMING_BOOKINGS()),
      dispatch(GET_INVENTORY_OVERVIEW()),
      dispatch(GET_INCOMING_DELIVERIES()),
    ];
    return () => requests.forEach((request) => request.abort());
  }, [dispatch]);

  const series = useMemo(
    () => buildCollectionSeries(collections?.overview, revenueRange),
    [collections?.overview, revenueRange],
  );
  const upcomingBookings = (bookingReport?.bookings || []).map(mapBooking);
  const bestSellers = (topSellingItems || []).map((item) => ({
    id: item.menuId, name: capitalize(item.name),
    sold: Number(item.quantitySold ?? 0), amount: Number(item.totalSales ?? 0),
  }));
  const inventoryAlerts = (inventoryOverview?.items || []).map(mapInventoryItem);
  const incomingDeliveries = (deliveryReport?.deliveries || []).map(mapDelivery);
  const totalSales = Number(summary?.totalCollections ?? 0);
  const bookingSales = Number(summary?.bookingCollections ?? 0);
  const posSales = Number(summary?.posSales ?? 0);
  const totalRevenue = Number(collections?.totalCollections ?? 0);
  const channelData = (collections?.bySource || []).filter((entry) => ["booking", "pos"].includes(entry.name));
  const hasCollections = (collections?.overview || []).some((entry) => Number(entry.booking) > 0 || Number(entry.pos) > 0);
  const summaryTrends = errors.summary ? [] : (summary?.trends || []);
  const data = {
    label: range.label,
    bookings: Number(summary?.verifiedPayments ?? 0),
    orders: Number(summary?.posTransactions ?? 0),
    outstanding: Number(summary?.outstandingBalance ?? 0),
  };
  const revenueData = { label: revenueRange.label, series };
  const outOfStockCount = Number(inventoryOverview?.statusCounts?.outOfStock ?? 0);
  const lowStockCount = Number(inventoryOverview?.statusCounts?.lowStock ?? 0);
  const statuses = [
    { name: "Approved", count: Number(bookingReport?.statusCounts?.approved ?? 0), color: "bg-chart-4" },
    { name: "Confirmed", count: Number(bookingReport?.statusCounts?.confirmed ?? 0), color: "bg-primary" },
    { name: "Setup", count: Number(bookingReport?.statusCounts?.setup ?? 0), color: "bg-accent" },
  ];
  return (
    <div className="min-h-full bg-background p-4 text-foreground md:p-6 xl:p-7">
      <div className="mx-auto max-w-[1440px] space-y-5">
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
                  <SelectValue>{period === "custom" ? "Custom Date Range" : data.label}</SelectValue>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
            {period === "custom" && (
              <div role="group" aria-label="Custom dashboard date range" className="[&_button]:h-10 [&_button]:rounded-lg [&_button]:text-xs">
                <DatePicker mode="range" date={customDate} setDate={handleCustomDateChange} highlightToday={false} />
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
                <DropdownMenuLabel className="text-xs">
                  Booking
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/platforms/reports/booking/sales">
                    Sales Report
                  </Link>
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

        {errors.summary && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <span>Could not load the summary: {errors.summary}</span>
            <Button variant="outline" size="sm" onClick={() => dispatch(GET_SUMMARY({ startDate, endDate }))}>Retry</Button>
          </div>
        )}
        <section
          aria-label="Business performance"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Metric
            isLoading={isLoadingSummary}
            showTrend
            title="Total Collections"
            value={errors.summary ? "—" : money(totalSales)}
            icon={PhilippinePeso}
            featured
            description="Booking + POS"
            detail="Total payments received"
            points={summaryTrends.map((entry) => Number(entry.total ?? 0))}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            isLoading={isLoadingSummary}
            showTrend
            title="Booking Collections"
            value={errors.summary ? "—" : money(bookingSales)}
            icon={CalendarDays}
            description={`${data.bookings} verified payments`}
            detail="Payments from bookings"
            points={summaryTrends.map((entry) => Number(entry.booking ?? 0))}
            to="/platforms/reports/booking/sales"
          />
          <Metric
            isLoading={isLoadingSummary}
            showTrend
            title="POS Sales"
            value={errors.summary ? "—" : money(posSales)}
            icon={ShoppingBag}
            gold
            description={`${data.orders.toLocaleString()} transactions`}
            detail="Sales from POS orders"
            points={summaryTrends.map((entry) => Number(entry.pos ?? 0))}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            isLoading={isLoadingSummary}
            title="Outstanding Balance"
            value={errors.summary ? "—" : money(data.outstanding)}
            icon={CreditCard}
            gold
            description={`${Number(summary?.bookingsWithBalance ?? 0)} bookings with balance`}
            detail="Unpaid booking balances"
            points={[]}
            to="/platforms/reports/booking/payments"
          />
        </section>

        <div className="grid gap-5 lg:grid-cols-12">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-8">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                    <ChartColumn className="size-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                      Collections Overview
                    </CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">
                      {revenueData.label}
                    </p>
                  </div>
                </div>
                <Select
                  value={revenueFrequency}
                  onValueChange={setRevenueFrequency}
                >
                  <SelectTrigger
                    aria-label="Collections frequency"
                    className="h-9 w-[116px] rounded-md bg-muted/25 text-xs font-medium shadow-none hover:bg-muted/50 focus-visible:ring-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-3 pt-5">
              {!isLoadingCollections && errors.collections ? (
                <DashboardFeedback error={errors.collections} onRetry={() => dispatch(GET_COLLECTIONS({ startDate, endDate, frequency }))} />
              ) : !isLoadingCollections && !hasCollections ? (
                <DashboardEmptyState icon={ChartColumn} title="No collections recorded" description="Booking payments and POS sales for this period will appear here." />
              ) : (
                <CollectionsOverviewChart series={revenueData.series} loading={isLoadingCollections} />
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-4">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex items-center gap-3 border-b pb-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                  <PhilippinePeso className="size-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                    Collections by Source
                  </CardTitle>
                  <p className="text-xs leading-4 text-muted-foreground">
                    {revenueData.label}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center px-3 py-5">
              {isLoadingCollections ? (
                <CollectionsDonutSkeleton />
              ) : errors.collections ? (
                <DashboardFeedback error={errors.collections} onRetry={() => dispatch(GET_COLLECTIONS({ startDate, endDate, frequency }))} />
              ) : !hasCollections ? (
                <DashboardEmptyState icon={PhilippinePeso} title="No collections recorded" description="The Booking and POS breakdown will appear once payments are received." />
              ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-[260px] w-full max-w-[300px] aspect-auto"
                aria-label="Collections distribution between Booking and POS"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="name" />}
                  />
                  <Pie
                    key={revenueFrequency}
                    data={channelData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="61%"
                    outerRadius="88%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="var(--card)"
                    strokeWidth={3}
                    isAnimationActive
                    animationBegin={100}
                    animationDuration={1400}
                    animationEasing="ease-out"
                  >
                    {channelData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          entry.name === "booking"
                            ? "var(--color-booking)"
                            : "var(--color-pos)"
                        }
                      />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox)) return null;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              dy="-3"
                              fill="var(--foreground)"
                              className="text-lg font-semibold tabular-nums"
                            >
                              {money(totalRevenue)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              dy="22"
                              fill="var(--muted-foreground)"
                              className="text-xs"
                            >
                              Total Collections
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-12">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-8">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex items-center justify-between gap-3 border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                    <CalendarDays className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                      Upcoming Bookings
                    </CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Next scheduled events
                    </p>
                  </div>
                </div>
                <ReportLink to="/platforms/events/bookings">
                  View All{" "}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </ReportLink>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-5">
              {isLoadingBookings ? (
                <UpcomingBookingsSkeleton />
              ) : errors.upcomingBookings ? (
                <DashboardFeedback error={errors.upcomingBookings} onRetry={() => dispatch(GET_UPCOMING_BOOKINGS())} />
              ) : upcomingBookings.length ? (
                <>
                  <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 border-b py-3">
                    <span className="text-[11px] text-muted-foreground">
                      Upcoming
                    </span>
                    {statuses.map((status) => (
                      <span
                        key={status.name}
                        className="inline-flex items-center gap-1.5 text-[11px]"
                      >
                        <span
                          className={`size-1.5 rounded-full ${status.color}`}
                          aria-hidden="true"
                        />
                        <span className="text-muted-foreground">
                          {status.name}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {status.count}
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-1 flex-col divide-y">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[44px_minmax(0,1fr)_88px] sm:gap-4 lg:min-h-[84px] lg:py-2.5"
                      >
                        <div className="overflow-hidden rounded-lg border bg-card text-center">
                          <p className="bg-muted/60 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground">
                            {booking.month}
                          </p>
                          <p className="py-1 text-xl font-semibold leading-6 tabular-nums">
                            {booking.day}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium leading-5 lg:truncate"
                            title={booking.event}
                          >
                            {booking.event}
                          </p>
                          <p className="text-xs leading-4 text-muted-foreground">
                            {booking.service}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] leading-4 tabular-nums text-muted-foreground">
                            <p className="inline-flex min-w-0 items-start gap-1.5">
                              <Clock3 className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                              <span>{booking.time}</span>
                            </p>
                            <p className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              <Users className="size-3 shrink-0" aria-hidden="true" />
                              <span>{booking.guests == null ? "Guests not specified" : `${booking.guests} guests`}</span>
                            </p>
                          </div>
                        </div>
                        <div className="justify-self-end">
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <DashboardEmptyState
                  icon={CalendarDays}
                  title="No upcoming bookings"
                  description="Your next scheduled events will appear here."
                />
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-4">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                    <UtensilsCrossed className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                      Top-Selling Items
                    </CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">
                      {data.label}
                    </p>
                  </div>
                </div>
                <ReportLink to="/platforms/reports/pos/sales">
                  Sales Report{" "}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </ReportLink>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col px-5">
              {isLoadingTopSelling ? (
                <TopSellingItemsSkeleton />
              ) : errors.topSellingItems ? (
                <DashboardFeedback error={errors.topSellingItems} onRetry={() => dispatch(GET_TOP_SELLING_ITEMS({ startDate, endDate }))} />
              ) : bestSellers.length ? (
                <>
                  <div className="flex min-h-11 items-center justify-between gap-2 border-b py-3 text-[11px] text-muted-foreground">
                    <span>Ranked by quantity sold</span>
                    <span className="tabular-nums">
                      {bestSellers.length} items
                    </span>
                  </div>
                  <ol className="divide-y">
                    {bestSellers.map((item, index) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 py-4 lg:h-[84px]"
                      >
                        <span
                          aria-label={`Rank ${index + 1}`}
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${index === 0 ? "bg-accent/20 text-accent-foreground" : "bg-muted/50 text-muted-foreground"}`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                            <p className="text-xs font-medium leading-5">
                              {item.name}
                            </p>
                            <p className="text-xs font-semibold tabular-nums">
                              {money(item.amount)}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <div
                              className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
                              aria-hidden="true"
                            >
                              <div
                                className={`h-full rounded-full ${index === 0 ? "bg-primary" : "bg-primary/35"}`}
                                style={{
                                  width: `${(item.sold / Math.max(...bestSellers.map((seller) => seller.sold), 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                              {item.sold} sold
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <DashboardEmptyState
                  icon={UtensilsCrossed}
                  title="No sales recorded"
                  description="Top-selling items will appear here once sales are recorded."
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                    <Boxes className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                      Inventory Overview
                    </CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Items that need replenishment
                    </p>
                  </div>
                </div>
                <ReportLink to="/platforms/inventory/stock-management">
                  View Inventory{" "}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </ReportLink>
              </div>
            </CardHeader>
            {isLoadingInventory ? (
              <InventoryOverviewSkeleton />
            ) : errors.inventoryOverview ? (
              <DashboardFeedback error={errors.inventoryOverview} onRetry={() => dispatch(GET_INVENTORY_OVERVIEW())} />
            ) : inventoryAlerts.length ? (
              <>
                <div className="mx-5 flex min-h-11 flex-wrap items-center gap-4 border-b py-3 text-[11px]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-chart-3" />
                    <span className="text-muted-foreground">Low Stock</span>
                    <span className="font-semibold tabular-nums">
                      {lowStockCount}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Out of Stock</span>
                    <span className="font-semibold tabular-nums">
                      {outOfStockCount}
                    </span>
                  </span>
                </div>
                <CardContent className="px-5">
                  <ul className="divide-y">
                    {inventoryAlerts.map((item) => {
                      const stockPercent = Math.min(
                        100,
                        Math.max(
                          0,
                          item.reorder > 0
                            ? (item.quantity / item.reorder) * 100
                            : 0,
                        ),
                      );
                      const isOutOfStock = item.quantity <= 0;
                      return (
                        <li key={item.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-5">
                                {capitalize(item.name)}
                              </p>
                              <p className="mt-0.5 text-[11px] leading-4 tabular-nums text-muted-foreground">
                                Reorder at {Stock.format(item.reorder)} {item.unit}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold leading-5 tabular-nums">
                                {Stock.format(item.quantity)} {item.unit}
                              </p>
                              <p
                                className={`mt-0.5 text-[11px] leading-4 ${isOutOfStock ? "text-destructive" : "text-amber-700 dark:text-amber-400"}`}
                              >
                                {isOutOfStock ? "Out of stock" : "Low stock"}
                              </p>
                            </div>
                          </div>
                          <div
                            role="meter"
                            aria-label={`${item.name}: stock relative to reorder level`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={stockPercent}
                            aria-valuetext={`${item.quantity} ${item.unit} on hand; reorder at ${item.reorder} ${item.unit}`}
                            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                          >
                            <div
                              className={`h-full rounded-full ${isOutOfStock ? "bg-destructive" : "bg-chart-3/80"}`}
                              style={{ width: `${stockPercent}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </>
            ) : (
              <DashboardEmptyState
                icon={Boxes}
                title="Stock levels are healthy"
                description="Items that fall below their reorder level will appear here."
              />
            )}
          </Card>

          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
            <CardHeader className="px-5 pb-0 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                    <Truck className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                      Incoming Deliveries
                    </CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">
                      Pending supplier deliveries
                    </p>
                  </div>
                </div>
                <ReportLink to="/platforms/orders/order-list">
                  View Orders{" "}
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </ReportLink>
              </div>
            </CardHeader>
            {isLoadingDeliveries ? (
              <IncomingDeliveriesSkeleton />
            ) : errors.incomingDeliveries ? (
              <DashboardFeedback error={errors.incomingDeliveries} onRetry={() => dispatch(GET_INCOMING_DELIVERIES())} />
            ) : incomingDeliveries.length ? (
              <>
                <CardContent className="px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableHead className="pl-5 text-xs">
                          Supplier / Order
                        </TableHead>
                        <TableHead className="text-xs">Expected</TableHead>
                        <TableHead className="text-right text-xs">
                          Status
                        </TableHead>
                        <TableHead className="pr-5 text-right text-xs">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomingDeliveries.map((delivery) => (
                        <TableRow
                          key={delivery.id}
                          className="h-16 last:border-b-0"
                        >
                          <TableCell className="pl-5">
                            <p className="text-xs font-medium">
                              {delivery.supplier}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {delivery.reference}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {delivery.expected}
                          </TableCell>
                          <TableCell className="text-right text-xs tabular-nums">
                            <Badge variant="outline" className="whitespace-nowrap border-chart-3/25 bg-chart-3/10 text-[10px] font-medium">{delivery.status}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap pr-5 text-right text-xs font-semibold tabular-nums">
                            {money(delivery.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </>
            ) : (
              <DashboardEmptyState
                icon={Truck}
                title="No incoming deliveries"
                description="Supplier orders will appear here when deliveries are scheduled."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const CollectionsOverviewChart = ({ series, loading }) => {
  const chartData = useMemo(() => {
    if (!loading) return series;
    const heights = [[54, 32], [72, 44], [46, 30], [82, 53], [65, 41], [90, 62], [58, 38]];
    return series.map((entry, index) => ({
      ...entry,
      booking: heights[index % heights.length][0],
      pos: heights[index % heights.length][1],
    }));
  }, [series, loading]);

  return (
    <div role={loading ? "status" : undefined} aria-label={loading ? "Loading collections overview" : undefined} className="min-w-0 w-full">
      <div aria-hidden={loading || undefined} className="mb-4 flex h-[18px] items-center justify-between gap-3">
        {loading ? <Skeleton className="h-2.5 w-16" /> : <span className="text-[11px] text-muted-foreground">Amount (PHP)</span>}
        <div className="flex gap-4">
          {loading ? [0, 1].map((item) => (
            <div key={item} className="flex items-center gap-1.5"><Skeleton className="size-2 rounded-full" /><Skeleton className="h-2.5 w-10" /></div>
          )) : <><Legend color="bg-primary">Booking</Legend><Legend color="bg-chart-3">POS</Legend></>}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto sm:h-[260px]" aria-hidden={loading || undefined}>
        <BarChart
          accessibilityLayer={!loading}
          data={chartData}
          margin={{ top: 10, right: 5, left: -12, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis
            dataKey="date" height={30} tickLine={false} axisLine={false}
            tickMargin={12} minTickGap={15} fontSize={11}
            tick={loading ? <CollectionsAxisSkeleton axis="x" /> : true}
          />
          <YAxis
            width={60} tickLine={false} axisLine={false} fontSize={11}
            domain={loading ? [0, 100] : [0, "auto"]}
            tickFormatter={(value) => new Intl.NumberFormat("en", { notation: "compact" }).format(value)}
            tick={loading ? <CollectionsAxisSkeleton axis="y" /> : true}
          />
          <ChartTooltip defaultIndex={0} active={loading ? false : undefined} cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="booking" fill={loading ? "var(--skeleton)" : "var(--color-booking)"}
            radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}
            className={loading ? "animate-pulse motion-reduce:animate-none" : undefined}
          />
          <Bar
            dataKey="pos" fill={loading ? "var(--skeleton)" : "var(--color-pos)"}
            fillOpacity={loading ? 0.6 : 1} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false}
            className={loading ? "animate-pulse motion-reduce:animate-none" : undefined}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

const CollectionsAxisSkeleton = ({ x = 0, y = 0, axis }) => (
  <rect
    x={axis === "y" ? x - 24 : x - 12}
    y={y - 4}
    width={24}
    height={8}
    rx={3}
    fill="var(--skeleton)"
    className="animate-pulse motion-reduce:animate-none"
  />
);
const CollectionsDonutSkeleton = () => (
  <div role="status" aria-label="Loading collections by source" className="mx-auto h-[260px] w-full max-w-[300px]">
    <svg viewBox="0 0 300 260" className="h-full w-full animate-pulse motion-reduce:animate-none" aria-hidden="true">
      <circle cx="150" cy="130" r="93" fill="none" stroke="var(--skeleton)" strokeWidth="34" strokeDasharray="365 4 211 4" transform="rotate(-90 150 130)" />
      <rect x="98" y="114" width="104" height="17" rx="4" fill="var(--skeleton)" />
      <rect x="112" y="141" width="76" height="9" rx="3" fill="var(--skeleton)" />
    </svg>
  </div>
);

const DashboardFeedback = ({ error, onRetry }) => (
    <div role="alert" className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-3 px-5 py-6 text-center">
      <p className="text-sm font-medium">Could not load this section</p>
      <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Try Again</Button>
    </div>
);

const DashboardEmptyState = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/25 text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-[240px] text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

const Metric = ({
  title,
  value,
  icon,
  description,
  detail,
  points = [],
  to,
  gold,
  featured,
  isLoading,
  showTrend = false,
}) => {
  const Icon = icon;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const chartPoints = points.map((point, index) => ({
    x: 4 + (index / Math.max(points.length - 1, 1)) * 96,
    y: 30 - ((point - min) / (max - min || 1)) * 24,
  }));
  const coordinates = chartPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  const lastPoint = chartPoints[chartPoints.length - 1];
  return (
    <Link
      to={to}
      aria-label={`${title}: ${value}. View report`}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${featured ? "border-primary/25" : "border-border"}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-4 top-0 h-0.5 w-8 rounded-b-full ${gold ? "bg-chart-3/70" : "bg-primary/70"}`}
      />
      <div className="px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-muted-foreground">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">
              {detail}
            </p>
          </div>
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${gold ? "bg-chart-3/10 text-chart-3" : "bg-primary/8 text-primary"}`}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-2.5 break-words text-[28px] font-semibold leading-tight tracking-tight tabular-nums">
          {isLoading ? <Skeleton aria-label="Loading amount" className="h-9 w-36" /> : value}
        </div>
      </div>
      <div className="mx-4 mt-auto flex min-h-10 items-center justify-between gap-3 border-t border-border/70 py-2">
        <div className="inline-flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
          {isLoading ? <Skeleton className="h-3 w-24" /> : description}
          <ArrowUpRight
            className="size-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        {isLoading && showTrend && (
          <svg viewBox="0 0 104 36" className="h-6 w-[72px] shrink-0 animate-pulse text-skeleton motion-reduce:animate-none" aria-hidden="true">
            <polygon points="4,36 4,27 20,19 36,23 52,12 68,17 84,7 100,13 100,36" fill="currentColor" opacity="0.35" />
            <polyline points="4,27 20,19 36,23 52,12 68,17 84,7 100,13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="13" r="2.5" fill="currentColor" />
          </svg>
        )}
        {!isLoading && points.length > 1 && <svg
          viewBox="0 0 104 36"
          className={`h-6 w-[72px] shrink-0 ${gold ? "text-chart-3" : "text-primary"}`}
          aria-hidden="true"
        >
          <polygon
            points={`4,36 ${coordinates} 100,36`}
            fill="currentColor"
            opacity="0.07"
          />
          <polyline
            points={coordinates}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {lastPoint && (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2.5"
              fill="currentColor"
              stroke="var(--card)"
              strokeWidth="1.5"
            />
          )}
        </svg>}
      </div>
    </Link>
  );
};

const Legend = ({ color, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <span className={`size-2 shrink-0 rounded-full ${color}`} />
    {children}
  </span>
);

const StatusBadge = ({ status }) => (
  <Badge
    variant="outline"
    className={`gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${status === "Setup" ? "border-accent/30 bg-accent/10 text-foreground" : "border-primary/15 bg-primary/5 text-primary"}`}
  >
    <span
      className={`size-1 rounded-full ${status === "Setup" ? "bg-chart-3" : "bg-primary"}`}
    />
    {status}
  </Badge>
);

const ReportLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </Link>
);

export default Dashboard;
