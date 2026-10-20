import { useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ArrowRight, ArrowUpRight, CalendarDays, ChartColumn, ChartNoAxesCombined, ChevronDown, ChevronRight, CreditCard,
  PhilippinePeso, ReceiptText, Search, ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  { day: "21", month: "OCT", event: "Reyes Family Celebration", service: "Venue + Catering", guests: 80, time: "11:00 AM", status: "Confirmed" },
  { day: "22", month: "OCT", event: "Team Appreciation Lunch", service: "Catering", guests: 120, time: "12:00 PM", status: "Setup" },
  { day: "24", month: "OCT", event: "Sofia's 18th Birthday", service: "Venue + Catering", guests: 150, time: "6:00 PM", status: "Confirmed" },
];
const recentTransactions = [
  { id: "A8F24C10", time: "10:50 AM", items: 4, amount: 680, cashier: "Maria Santos" },
  { id: "A8F24C09", time: "10:42 AM", items: 2, amount: 320, cashier: "Juan Reyes" },
  { id: "A8F24C08", time: "10:35 AM", items: 6, amount: 1120, cashier: "Maria Santos" },
];
const bestSellers = [
  { name: "Pork Menudo", sold: 86, amount: 10320 },
  { name: "Chicken Adobo", sold: 72, amount: 9360 },
  { name: "Beef Caldereta", sold: 54, amount: 9720 },
];
const chartConfig = {
  booking: { label: "Booking Revenue", color: "var(--primary)" },
  pos: { label: "POS Revenue", color: "var(--chart-3)" },
};
const money = (value) => Formatter.amount(value);

const Dashboard = () => {
  const [period, setPeriod] = useState("week");
  const [revenueFrequency, setRevenueFrequency] = useState("week");
  const [search, setSearch] = useState("");
  const data = periods[period];
  const bookingSales = data.series.reduce((sum, day) => sum + day.booking, 0);
  const posSales = data.series.reduce((sum, day) => sum + day.pos, 0);
  const totalSales = bookingSales + posSales;
  const revenueData = periods[revenueFrequency];
  const bookingRevenue = revenueData.series.reduce((sum, entry) => sum + entry.booking, 0);
  const posRevenue = revenueData.series.reduce((sum, entry) => sum + entry.pos, 0);
  const totalRevenue = bookingRevenue + posRevenue;
  const channelData = [
    { name: "booking", value: bookingRevenue },
    { name: "pos", value: posRevenue },
  ];
  const filteredTransactions = recentTransactions.filter((transaction) =>
    `${transaction.id} ${transaction.cashier}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const statuses = [
    { name: "Confirmed", count: period === "week" ? 6 : 19, color: "bg-primary" },
    { name: "Setup", count: period === "week" ? 2 : 5, color: "bg-accent" },
    { name: "Completed", count: period === "week" ? 4 : 14, color: "bg-chart-4" },
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
              <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">Dashboard</h1>
              <p className="mt-1 text-xs text-muted-foreground">Booking &amp; POS</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger
                aria-label={`Reporting period: ${data.label}`}
                className="h-10 min-w-0 flex-1 gap-3 rounded-lg bg-card px-3 text-xs shadow-none sm:w-[225px] sm:flex-none"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
                <Button variant="outline" className="h-10 shrink-0 gap-2 rounded-lg bg-card px-3 text-xs shadow-none">
                  <ReceiptText className="size-4 text-muted-foreground" aria-hidden="true" />
                  Reports
                  <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs">Booking</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/platforms/reports/booking/sales">Sales Report</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/platforms/reports/booking/payments">Payments Report</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">POS</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/platforms/reports/pos/sales">Sales Report</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/platforms/reports/pos/transactions">Transactions Report</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section aria-label="Business performance" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Total Sales" value={money(totalSales)} icon={PhilippinePeso}
            description="Booking + POS" detail="Combined sales"
            points={data.series.map((day) => day.booking + day.pos)}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            title="Booking Sales" value={money(bookingSales)} icon={CalendarDays}
            description={`${data.bookings} bookings`} detail="Catering & venue"
            points={data.series.map((day) => day.booking)}
            to="/platforms/reports/booking/sales"
          />
          <Metric
            title="POS Sales" value={money(posSales)} icon={ShoppingBag} gold
            description={`${data.orders.toLocaleString()} transactions`} detail="Point of sale"
            points={data.series.map((day) => day.pos)}
            to="/platforms/reports/pos/sales"
          />
          <Metric
            title="Outstanding Balance" value={money(data.outstanding)} icon={CreditCard} gold
            description="Booking balances" detail="To be collected"
            points={period === "week" ? [36, 30, 34, 28, 29, 20, 24.5] : [120, 108, 94, 82, 76.5]}
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
                    <CardTitle className="text-sm font-semibold leading-5 tracking-tight">Revenue Overview</CardTitle>
                    <p className="text-xs leading-4 text-muted-foreground">{revenueData.label}</p>
                  </div>
                </div>
                <Select value={revenueFrequency} onValueChange={setRevenueFrequency}>
                  <SelectTrigger aria-label="Revenue frequency" className="h-9 w-[116px] rounded-md bg-muted/25 text-xs font-medium shadow-none hover:bg-muted/50 focus-visible:ring-1">
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
                <span className="text-[11px] text-muted-foreground">Revenue (PHP)</span>
                <div className="flex gap-4">
                <Legend color="bg-primary">Booking</Legend>
                <Legend color="bg-chart-3">POS</Legend>
                </div>
              </div>
              <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto sm:h-[260px]">
                <BarChart accessibilityLayer data={revenueData.series} margin={{ top: 10, right: 5, left: -12, bottom: 0 }} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} minTickGap={15} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => new Intl.NumberFormat("en", { notation: "compact" }).format(value)} fontSize={11} />
                  <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<ChartTooltipContent formatter={formatChartValue} />} />
                  <Bar dataKey="booking" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="pos" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={28} />
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
                  <CardTitle className="text-sm font-semibold leading-5 tracking-tight">Revenue by Channel</CardTitle>
                  <p className="text-xs leading-4 text-muted-foreground">{revenueData.label}</p>
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
                  <ChartTooltip content={<ChartTooltipContent hideLabel formatter={formatChartValue} />} />
                  <Pie
                    data={channelData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="61%"
                    outerRadius="88%"
                    startAngle={90}
                    endAngle={-270}
                    stroke="var(--card)"
                    strokeWidth={3}
                  >
                    {channelData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === "booking" ? "var(--primary)" : "var(--chart-3)"} />
                    ))}
                    <Label content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} dy="-3" fill="var(--foreground)" className="text-lg font-semibold tabular-nums">{money(totalRevenue)}</tspan>
                          <tspan x={viewBox.cx} dy="22" fill="var(--muted-foreground)" className="text-xs">Overall Revenue</tspan>
                        </text>
                      );
                    }} />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-12">
          <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-8">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Upcoming Bookings</CardTitle>
                  <span className="rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{upcomingBookings.length}</span>
                </div>
                <ReportLink to="/platforms/events/bookings">View All <ChevronRight className="size-3.5" /></ReportLink>
              </div>
            </CardHeader>
            <div className="grid grid-cols-3 divide-x border-b bg-muted/20">
              {statuses.map((status) => (
                <div key={status.name} className="px-3 py-3 sm:px-5">
                  <Legend color={status.color}>{status.name}</Legend>
                  <p className="mt-1.5 text-lg font-semibold tabular-nums">{status.count}</p>
                </div>
              ))}
            </div>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/25 hover:bg-muted/25">
                    <TableHead className="pl-5 text-xs">Event / Service</TableHead>
                    <TableHead className="text-xs">Schedule</TableHead>
                    <TableHead className="text-right text-xs">Guests</TableHead>
                    <TableHead className="pr-5 text-right text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingBookings.map((booking) => (
                    <TableRow key={booking.event} className="last:border-b-0">
                      <TableCell className="py-4 pl-5">
                        <p className="whitespace-nowrap text-xs font-medium">{booking.event}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{booking.service}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-xs font-medium">Oct {booking.day}, 2026</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{booking.time}</p>
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">{booking.guests}</TableCell>
                      <TableCell className="pr-5 text-right"><StatusBadge status={booking.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <div className="mt-auto flex items-center justify-between gap-3 border-t bg-muted/15 px-5 py-3 text-xs">
              <span className="text-muted-foreground">Outstanding Balance</span>
              <ReportLink to="/platforms/reports/booking/payments">{money(data.outstanding)} <ArrowUpRight className="size-3.5" /></ReportLink>
            </div>
          </Card>

          <Card className="min-w-0 gap-0 rounded-xl py-0 shadow-sm lg:col-span-4">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Top-Selling Items</CardTitle>
                <ShoppingBag className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-5 py-5">
              {bestSellers.map((item, index) => (
                <div key={item.name} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-xs font-medium text-muted-foreground">0{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium">{item.name}</p>
                      <p className="text-xs font-semibold tabular-nums">{money(item.amount)}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{item.sold} sold</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div className={index === 0 ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-primary/40"} style={{ width: `${item.sold / bestSellers[0].sold * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="mt-auto border-t px-5 py-3">
              <ReportLink to="/platforms/reports/pos/sales">View Sales Report <ArrowRight className="size-3.5" /></ReportLink>
            </div>
          </Card>
        </div>

        <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
          <CardHeader className="border-b px-5 py-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <ReceiptText className="size-4 text-primary" aria-hidden="true" />
                <CardTitle className="text-sm">Recent POS Transactions</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative min-w-0 flex-1 sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." aria-label="Search transactions or cashiers" className="h-8 bg-background pl-8 text-xs shadow-none" />
                </div>
                <ReportLink to="/platforms/reports/pos/transactions">View All <ChevronRight className="size-3.5" /></ReportLink>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/25 hover:bg-muted/25">
                  <TableHead className="pl-5 text-xs">Transaction ID</TableHead>
                  <TableHead className="text-xs">Cashier</TableHead>
                  <TableHead className="text-xs">Date & Time</TableHead>
                  <TableHead className="text-right text-xs">Items</TableHead>
                  <TableHead className="pr-5 text-right text-xs">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length ? filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="last:border-b-0">
                    <TableCell className="py-3.5 pl-5 text-xs font-medium">#{transaction.id}</TableCell>
                    <TableCell className="text-xs">{transaction.cashier}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">Oct 20, 2026 <span className="mx-1 text-border">/</span> {transaction.time}</TableCell>
                    <TableCell className="text-right text-xs tabular-nums">{transaction.items}</TableCell>
                    <TableCell className="pr-5 text-right text-xs font-semibold tabular-nums">{money(transaction.amount)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">No matching transactions.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Metric = ({ title, value, icon, description, detail, points, to, gold }) => {
  const Icon = icon;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const coordinates = points.map((point, index) => `${index / (points.length - 1) * 88},${34 - (point - min) / (max - min || 1) * 26}`).join(" ");
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="p-4 pb-3.5 xl:p-5 xl:pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`flex size-7 items-center justify-center rounded-md ${gold ? "bg-accent/15 text-foreground" : "bg-primary/8 text-primary"}`}><Icon className="size-3.5" aria-hidden="true" /></span>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
          </div>
          <Link to={to} aria-label={`View ${title.toLowerCase()} report`} className="rounded text-muted-foreground/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowUpRight className="size-3.5" aria-hidden="true" /></Link>
        </div>
        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="min-w-0 break-words text-[26px] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
          <svg viewBox="0 0 88 40" className={`h-9 w-[72px] shrink-0 ${gold ? "text-chart-3" : "text-primary"}`} aria-hidden="true">
            <polygon points={`0,40 ${coordinates} 88,40`} fill="currentColor" opacity="0.08" />
            <polyline points={coordinates} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 border-t bg-muted/20 px-4 py-2.5 text-[11px] xl:px-5">
        <span className="font-medium">{description}</span>
        <span className="text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
};

const Legend = ({ color, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`size-2 shrink-0 rounded-full ${color}`} />{children}</span>
);

const StatusBadge = ({ status }) => (
  <Badge variant="outline" className={`gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-medium ${status === "Setup" ? "border-accent/30 bg-accent/10 text-foreground" : "border-primary/15 bg-primary/5 text-primary"}`}>
    <span className={`size-1 rounded-full ${status === "Setup" ? "bg-chart-3" : "bg-primary"}`} />{status}
  </Badge>
);

const ReportLink = ({ to, children }) => (
  <Link to={to} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{children}</Link>
);

const formatChartValue = (value, name) => (
  <span className="flex w-full items-center justify-between gap-4">
    <span className="text-muted-foreground">{chartConfig[name]?.label || name}</span>
    <span className="font-medium tabular-nums">{money(value)}</span>
  </span>
);

export default Dashboard;
