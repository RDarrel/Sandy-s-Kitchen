import { useState } from "react";
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
import { Formatter } from "@/services/utilities";

// Design preview data. Replace with dashboard reports when the data integration is ready.
const periods = {
  week: {
    label: "October 19 - 25, 2026",
    orders: 286,
    bookings: 12,
    outstanding: 24500,
    series: [
      { date: "Mon", booking: 18000, pos: 8200 },
      { date: "Tue", booking: 12000, pos: 10600 },
      { date: "Wed", booking: 24000, pos: 9400 },
      { date: "Thu", booking: 16000, pos: 12800 },
      { date: "Fri", booking: 28000, pos: 15600 },
      { date: "Sat", booking: 36000, pos: 19400 },
      { date: "Sun", booking: 22000, pos: 14200 },
    ],
  },
  month: {
    label: "October 2026",
    orders: 1148,
    bookings: 38,
    outstanding: 76500,
    series: [
      { date: "Oct 1-4", booking: 68000, pos: 36200 },
      { date: "Oct 5-11", booking: 124000, pos: 74800 },
      { date: "Oct 12-18", booking: 138000, pos: 82400 },
      { date: "Oct 19-25", booking: 156000, pos: 90200 },
      { date: "Oct 26-31", booking: 96000, pos: 66800 },
    ],
  },
  year: {
    label: "2026",
    series: [
      { date: "Jan", booking: 324000, pos: 218000 },
      { date: "Feb", booking: 356000, pos: 234000 },
      { date: "Mar", booking: 402000, pos: 258000 },
      { date: "Apr", booking: 378000, pos: 242000 },
      { date: "May", booking: 460000, pos: 286000 },
      { date: "Jun", booking: 428000, pos: 274000 },
      { date: "Jul", booking: 496000, pos: 302000 },
      { date: "Aug", booking: 472000, pos: 288000 },
      { date: "Sep", booking: 524000, pos: 316000 },
      { date: "Oct", booking: 582000, pos: 350400 },
      { date: "Nov", booking: 548000, pos: 338000 },
      { date: "Dec", booking: 684000, pos: 412000 },
    ],
  },
};
const upcomingBookings = [
  {
    day: "21",
    month: "OCT",
    event: "Reyes Family Celebration",
    service: "Venue + Catering",
    guests: 80,
    time: "11:00 AM",
    status: "Confirmed",
  },
  {
    day: "22",
    month: "OCT",
    event: "Team Appreciation Lunch",
    service: "Catering",
    guests: 120,
    time: "12:00 PM",
    status: "Setup",
  },
  {
    day: "24",
    month: "OCT",
    event: "Sofia's 18th Birthday",
    service: "Venue + Catering",
    guests: 150,
    time: "6:00 PM",
    status: "Confirmed",
  },
  {
    day: "25",
    month: "OCT",
    event: "Santos Wedding Reception",
    service: "Venue + Catering",
    guests: 200,
    time: "5:00 PM",
    status: "Confirmed",
  },
  {
    day: "27",
    month: "OCT",
    event: "Company Anniversary Lunch",
    service: "Catering",
    guests: 100,
    time: "12:30 PM",
    status: "Confirmed",
  },
];
const inventoryAlerts = [
  { name: "Pork Shoulder", quantity: 4, reorder: 10, unit: "kg" },
  { name: "Chicken", quantity: 6, reorder: 15, unit: "kg" },
  { name: "Cooking Oil", quantity: 0, reorder: 8, unit: "L" },
  { name: "Rice", quantity: 12, reorder: 25, unit: "kg" },
];
const incomingDeliveries = [
  {
    reference: "PO-2026-1042",
    supplier: "Fresh Choice Meats",
    expected: "Oct 20, 2026",
    items: 6,
    amount: 12400,
  },
  {
    reference: "PO-2026-1043",
    supplier: "Farm Fresh Produce",
    expected: "Oct 21, 2026",
    items: 8,
    amount: 4850,
  },
  {
    reference: "PO-2026-1044",
    supplier: "Golden Grain Trading",
    expected: "Oct 22, 2026",
    items: 3,
    amount: 8600,
  },
  {
    reference: "PO-2026-1045",
    supplier: "Kitchen Essentials Supply",
    expected: "Oct 23, 2026",
    items: 5,
    amount: 3200,
  },
  {
    reference: "PO-2026-1046",
    supplier: "Daily Dairy Supply",
    expected: "Oct 24, 2026",
    items: 4,
    amount: 5600,
  },
];
const bestSellers = [
  { name: "Pork Menudo", sold: 86, amount: 10320 },
  { name: "Chicken Adobo", sold: 72, amount: 9360 },
  { name: "Beef Caldereta", sold: 54, amount: 9720 },
  { name: "Pork Sinigang", sold: 48, amount: 6720 },
  { name: "Pancit Canton", sold: 41, amount: 4510 },
];
const chartConfig = {
  booking: { label: "Booking", color: "var(--primary)" },
  pos: { label: "POS", color: "var(--chart-3)" },
};
const money = (value) => Formatter.amount(value);

const Dashboard = () => {
  const [period, setPeriod] = useState("week");
  const [revenueFrequency, setRevenueFrequency] = useState("week");
  const data = periods[period];
  const bookingSales = data.series.reduce((sum, day) => sum + day.booking, 0);
  const posSales = data.series.reduce((sum, day) => sum + day.pos, 0);
  const totalSales = bookingSales + posSales;
  const revenueData = periods[revenueFrequency];
  const bookingRevenue = revenueData.series.reduce(
    (sum, entry) => sum + entry.booking,
    0,
  );
  const posRevenue = revenueData.series.reduce(
    (sum, entry) => sum + entry.pos,
    0,
  );
  const totalRevenue = bookingRevenue + posRevenue;
  const channelData = [
    { name: "booking", value: bookingRevenue },
    { name: "pos", value: posRevenue },
  ];
  const outOfStockCount = inventoryAlerts.filter(
    (item) => item.quantity <= 0,
  ).length;
  const lowStockCount = inventoryAlerts.length - outOfStockCount;
  const statuses = [
    {
      name: "Confirmed",
      count: period === "week" ? 6 : 19,
      color: "bg-primary",
    },
    { name: "Setup", count: period === "week" ? 2 : 5, color: "bg-accent" },
    {
      name: "Completed",
      count: period === "week" ? 4 : 14,
      color: "bg-chart-4",
    },
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
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger
                aria-label={`Reporting period: ${data.label}`}
                className="h-10 min-w-0 flex-1 gap-3 rounded-lg bg-card px-3 text-xs shadow-none sm:w-[225px] sm:flex-none"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <CalendarDays
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <SelectValue>{data.label}</SelectValue>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 shrink-0 gap-2 rounded-lg bg-card px-3 text-xs shadow-none"
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

        <section
          aria-label="Business performance"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <Metric
            title="Total Collections"
            value={money(totalSales)}
            icon={PhilippinePeso}
            featured
            description="Booking + POS"
            detail="Total payments received"
            points={data.series.map((day) => day.booking + day.pos)}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            title="Booking Collections"
            value={money(bookingSales)}
            icon={CalendarDays}
            description={`${data.bookings} verified payments`}
            detail="Payments from bookings"
            points={data.series.map((day) => day.booking)}
            to="/platforms/reports/booking/sales"
          />
          <Metric
            title="POS Sales"
            value={money(posSales)}
            icon={ShoppingBag}
            gold
            description={`${data.orders.toLocaleString()} transactions`}
            detail="Sales from POS orders"
            points={data.series.map((day) => day.pos)}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            title="Outstanding Balance"
            value={money(data.outstanding)}
            icon={CreditCard}
            gold
            description="To be collected"
            detail="Unpaid booking balances"
            points={
              period === "week"
                ? [36, 30, 34, 28, 29, 20, 24.5]
                : [120, 108, 94, 82, 76.5]
            }
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
                    aria-label="Revenue frequency"
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted-foreground">
                  Amount (PHP)
                </span>
                <div className="flex gap-4">
                  <Legend color="bg-primary">Booking</Legend>
                  <Legend color="bg-chart-3">POS</Legend>
                </div>
              </div>
              <ChartContainer
                config={chartConfig}
                className="h-[240px] w-full aspect-auto sm:h-[260px]"
              >
                <BarChart
                  accessibilityLayer
                  data={revenueData.series}
                  margin={{ top: 10, right: 5, left: -12, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--border)"
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    minTickGap={15}
                    fontSize={11}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en", {
                        notation: "compact",
                      }).format(value)
                    }
                    fontSize={11}
                  />
                  <ChartTooltip
                    defaultIndex={0}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="booking"
                    fill="var(--color-booking)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="pos"
                    fill="var(--color-pos)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ChartContainer>
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
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-[260px] w-full max-w-[300px] aspect-auto"
                aria-label="Revenue distribution between Booking and POS"
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
              {upcomingBookings.length ? (
                <>
                  <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 border-b py-3">
                    <span className="text-[11px] text-muted-foreground">
                      {period === "week" ? "This week" : "This month"}
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
                        key={booking.event}
                        className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[44px_minmax(0,1fr)_88px] sm:gap-4 lg:h-[84px] lg:py-2.5"
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
                            <p className="inline-flex w-[88px] items-center gap-1.5 whitespace-nowrap">
                              <Clock3
                                className="size-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{booking.time}</span>
                            </p>
                            <p className="inline-flex items-center gap-1.5 whitespace-nowrap">
                              <Users
                                className="size-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span>{booking.guests} guests</span>
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
                      October 19 - 25, 2026
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
              {bestSellers.length ? (
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
                        key={item.name}
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
            {inventoryAlerts.length ? (
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
                        <li key={item.name} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-5">
                                {item.name}
                              </p>
                              <p className="mt-0.5 text-[11px] leading-4 tabular-nums text-muted-foreground">
                                Reorder at {item.reorder} {item.unit}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold leading-5 tabular-nums">
                                {item.quantity} {item.unit}
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
            {incomingDeliveries.length ? (
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
                          Items
                        </TableHead>
                        <TableHead className="pr-5 text-right text-xs">
                          Amount
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomingDeliveries.map((delivery) => (
                        <TableRow
                          key={delivery.reference}
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
                            {delivery.items}
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
  points,
  to,
  gold,
  featured,
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
        <p className="mt-2.5 break-words text-[28px] font-semibold leading-tight tracking-tight tabular-nums">
          {value}
        </p>
      </div>
      <div className="mx-4 mt-auto flex items-center justify-between gap-3 border-t border-border/70 py-2">
        <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
          {description}
          <ArrowUpRight
            className="size-3 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
            aria-hidden="true"
          />
        </span>
        <svg
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
        </svg>
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
