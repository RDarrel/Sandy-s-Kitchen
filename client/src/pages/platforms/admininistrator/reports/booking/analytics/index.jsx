import { useMemo, useState } from "react";
import { ArrowDownToLine, BarChart3, CalendarDays, ChevronDown, Loader2, MapPin, Package, Users, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAnalytics, money, PERIODS } from "./data";
import BookingChart from "./chart";
import Summary from "./summary";

const panel = "min-w-0 rounded-2xl border border-border bg-card shadow-sm";
const rankings = [
  { key: "packages", title: "Most Booked Packages", subtitle: "Catering packages ranked by number of bookings.", label: "Package", icon: Package, tone: "bg-primary/10 text-primary", bar: "bg-primary" },
  { key: "venues", title: "Most Booked Venues", subtitle: "Venues ranked by number of bookings.", label: "Venue", icon: MapPin, tone: "bg-orange-500/10 text-orange-700 dark:text-orange-400", bar: "bg-orange-500" },
  { key: "dishes", title: "Most Selected Dishes", subtitle: "Dishes ranked by the number of bookings that include them.", label: "Dish", icon: UtensilsCrossed, tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300", bar: "bg-amber-500" },
  { key: "customers", title: "Top Booking Customers", subtitle: "Customers ranked by number of bookings.", label: "Customer", icon: Users, tone: "bg-primary/10 text-primary", bar: "bg-primary" },
];

function RankingCard({ config, rows }) {
  const [expanded, setExpanded] = useState(false);
  const { icon: Icon, title, subtitle, label, tone, bar, key } = config;
  const visible = expanded ? rows : rows.slice(0, 5);
  return (
    <section className={panel}>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
          <div><h3 className="text-sm font-semibold sm:text-base">{title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p></div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs text-muted-foreground" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          {expanded ? "Show less" : "View all"}<ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
        </Button>
      </div>
      <div className="overflow-x-auto px-5 pb-3">
        <table className="w-full min-w-[410px] text-left text-xs">
          <caption className="sr-only">{title}, ranked by number of bookings</caption>
          <thead><tr className="border-y border-border/60 bg-muted/35 text-muted-foreground">
            <th scope="col" className="w-9 py-2.5 pl-2 font-medium">#</th>
            <th scope="col" className="py-2.5 font-medium">{label}</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">Bookings</th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium">{key === "dishes" ? "Category" : "Booking value"}</th>
            <th scope="col" className="w-28 py-2.5 pr-2 text-right font-medium" title="Percentage of bookings in the selected period">Booking share</th>
          </tr></thead>
          <tbody>{visible.map((row, index) => (
            <tr key={row.name} className="border-b border-border/45 last:border-0 hover:bg-muted/20">
              <td className="py-3.5 pl-2"><span className={`flex size-5 items-center justify-center rounded-md text-[10px] font-semibold ${index === 0 ? tone : "text-muted-foreground"}`}>{index + 1}</span></td>
              <th scope="row" className="py-3.5 pr-2 font-medium">{row.name}</th>
              <td className="px-3 py-3.5 text-right font-semibold tabular-nums">{row.bookings}</td>
              <td className="whitespace-nowrap px-3 py-3.5 text-right text-muted-foreground tabular-nums">{key === "dishes" ? row.category : money(row.value)}</td>
              <td className="py-3.5 pr-2"><div className="flex items-center justify-end gap-2"><span className="text-[11px] tabular-nums">{row.percentage.toFixed(1)}%</span><div className="h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${bar}`} style={{ width: `${row.percentage}%` }} /></div></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

const Analytics = () => {
  const [period, setPeriod] = useState("ytd");
  const [metric, setMetric] = useState("bookings");
  const [exporting, setExporting] = useState(false);
  const data = useMemo(() => getAnalytics(period), [period]);
  const selectedPeriod = PERIODS[period].label;

  const handleExport = async () => {
    setExporting(true);
    try {
      const { Workbook } = await import("exceljs");
      const { saveAs } = await import("file-saver");
      const workbook = new Workbook();
      workbook.addWorksheet("Overview").addRows([["Booking Analytics - SAMPLE DATA"], ["Period", selectedPeriod], ["Total bookings", data.total], ["Booking value (PHP)", data.value], [], ["Month", "Bookings", "Booking value (PHP)"], ...data.monthly.map((month) => [month.month, month.bookings, month.value])]);
      rankings.forEach(({ key, title }) => {
        const sheet = workbook.addWorksheet(title.slice(0, 31));
        sheet.addRow(["Name", "Bookings", key === "dishes" ? "Category" : "Booking value (PHP)", "Share of bookings (%)"]);
        data[key].forEach((row) => sheet.addRow([row.name, row.bookings, key === "dishes" ? row.category : row.value, Number(row.percentage.toFixed(1))]));
      });
      workbook.eachSheet((sheet) => {
        sheet.columns.forEach((column) => { column.width = 28; });
        sheet.getRow(1).font = { bold: true, color: { argb: "FFC62828" } };
      });
      saveAs(new Blob([await workbook.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `booking-analytics-sample-${period}-2026.xlsx`);
      toast.success("Sample analytics exported.");
    } catch {
      toast.error("Unable to export analytics. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Booking Analytics</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Monitor booking trends, booking value, and customer activity for the selected period.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={period} onValueChange={setPeriod}><SelectTrigger aria-label="Analytics period" className="w-[195px] bg-card"><CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" /><SelectValue /></SelectTrigger><SelectContent>{Object.entries(PERIODS).map(([value, item]) => <SelectItem key={value} value={value}>{item.label}</SelectItem>)}</SelectContent></Select>
            <Button onClick={handleExport} disabled={exporting}>{exporting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ArrowDownToLine className="size-4" aria-hidden="true" />}{exporting ? "Exporting…" : "Export to Excel"}</Button>
          </div>
        </header>
        <Summary data={data} />
        <section className={`${panel} overflow-hidden`}>
          <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><BarChart3 className="size-5" aria-hidden="true" /></span><div><h2 className="font-semibold">Monthly Booking Trends</h2><p className="mt-0.5 text-xs text-muted-foreground">Monthly booking counts and total booking value for the selected period.</p></div></div>
            <div className="inline-flex w-fit gap-1 rounded-lg border border-border/60 bg-muted/50 p-1" role="group" aria-label="Chart metric">{[["bookings", "Bookings"], ["value", "Booking value"]].map(([value, label]) => <button key={value} type="button" aria-pressed={metric === value} onClick={() => setMetric(value)} className={`rounded-md px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${metric === value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</button>)}</div>
          </div>
          <BookingChart data={data.monthly} metric={metric} />
        </section>
        <div className="grid items-start gap-5 xl:grid-cols-2">{rankings.map((config) => <RankingCard key={config.key} config={config} rows={data[config.key]} />)}</div>
      </div>
    </div>
  );
};

export default Analytics;
