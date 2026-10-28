import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  BarChart3,
  Loader2,
  MapPin,
  Package,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { endOfMonth, format, startOfYear } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/shared/datePicker";
import { GET_ANALYTICS } from "@/services/redux/slices/report/booking";
import { formatAnalytics } from "./data";
import BookingChart from "./chart";
import Summary from "./summary";
import RankingCard from "./RankingCard";
import AnalyticsSkeleton from "./Skeleton";

const panel = "min-w-0 rounded-2xl border border-border bg-card shadow-sm";
const rankings = [
  {
    key: "packages",
    title: "Most-Booked Packages",
    subtitle: "Catering packages ranked by number of bookings.",
    label: "Package",
    icon: Package,
    tone: "bg-primary/10 text-primary",
    bar: "bg-primary",
  },
  {
    key: "venues",
    title: "Most-Booked Venues",
    subtitle: "Venues ranked by number of bookings.",
    label: "Venue",
    icon: MapPin,
    tone: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    bar: "bg-orange-500",
  },
  {
    key: "dishes",
    title: "Most-Selected Dishes",
    subtitle:
      "Catering dishes ranked by the number of bookings they appear in.",
    label: "Dish",
    icon: UtensilsCrossed,
    tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  {
    key: "customers",
    title: "Top Booking Customers",
    subtitle: "Customers ranked by their number of bookings.",
    label: "Customer",
    icon: Users,
    tone: "bg-primary/10 text-primary",
    bar: "bg-primary",
  },
];

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, analyticsRequestId, message } = useSelector(
    ({ bookingReport }) => bookingReport,
  );
  const loading = Boolean(analyticsRequestId);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return { from: startOfYear(today), to: endOfMonth(today) };
  });
  const [metric, setMetric] = useState("bookings");
  const [exporting, setExporting] = useState(false);
  const startDate = format(date.from, "yyyy-MM-dd");
  const endDate = format(date.to, "yyyy-MM-dd");

  useEffect(() => {
    const request = dispatch(GET_ANALYTICS({ startDate, endDate }));
    return () => request.abort();
  }, [dispatch, startDate, endDate]);
  const data = useMemo(
    () => formatAnalytics(analytics, date),
    [analytics, date],
  );
  const selectedPeriod = `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`;

  const handleExport = async () => {
    setExporting(true);
    try {
      const { Workbook } = await import("exceljs");
      const { saveAs } = await import("file-saver");
      const workbook = new Workbook();
      workbook
        .addWorksheet("Overview")
        .addRows([
          ["Booking Analytics"],
          ["Period", selectedPeriod],
          ["Total bookings", data.total],
          ["Booking value (PHP)", data.value],
          [],
          ["Month", "Bookings", "Booking value (PHP)"],
          ...data.monthly.map((month) => [
            month.month,
            month.bookings,
            month.value,
          ]),
        ]);
      rankings.forEach(({ key, title }) => {
        const sheet = workbook.addWorksheet(title.slice(0, 31));
        sheet.addRow([
          "Name",
          "Bookings",
          key === "dishes" ? "Category" : "Booking value (PHP)",
          "Share of bookings (%)",
        ]);
        data[key].forEach((row) =>
          sheet.addRow([
            row.name,
            row.bookings,
            key === "dishes" ? row.category : row.value,
            Number(row.percentage.toFixed(1)),
          ]),
        );
      });
      workbook.eachSheet((sheet) => {
        sheet.columns.forEach((column) => {
          column.width = 28;
        });
        sheet.getRow(1).font = { bold: true, color: { argb: "FFC62828" } };
      });
      saveAs(
        new Blob([await workbook.xlsx.writeBuffer()], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `booking-analytics-${startDate}-to-${endDate}.xlsx`,
      );
      toast.success("Booking analytics exported.");
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
            <h1 className="text-xl font-semibold tracking-tight">
              Booking Analytics
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Analyze booking trends, popular packages and venues, and customer
              activity within the selected period.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              mode="range"
              captionLayout="dropdown"
              date={date}
              setDate={setDate}
            />
            <Button
              onClick={handleExport}
              disabled={exporting || loading || Boolean(message)}
            >
              {exporting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowDownToLine className="size-4" aria-hidden="true" />
              )}
              {exporting ? "Exporting…" : "Export to Excel"}
            </Button>
          </div>
        </header>
        {!loading && message && (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        )}
        {loading ? (
          <AnalyticsSkeleton monthCount={data.monthly.length} />
        ) : (
          <>
            <Summary data={data} />
            <section className={`${panel} overflow-hidden`}>
              <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BarChart3 className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold">Booking Trends</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Track booking counts and value over the selected period.
                    </p>
                  </div>
                </div>
                <div
                  className="inline-flex w-fit gap-1 rounded-lg border border-border/60 bg-muted/50 p-1"
                  role="group"
                  aria-label="Chart metric"
                >
                  {[
                    ["bookings", "Bookings"],
                    ["value", "Booking Value"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={metric === value}
                      onClick={() => setMetric(value)}
                      className={`rounded-md px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring ${metric === value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <BookingChart data={data.monthly} metric={metric} />
            </section>
            <div className="grid items-stretch gap-5 xl:grid-cols-2">
              {rankings.map((config) => (
                <RankingCard
                  key={config.key}
                  config={config}
                  rows={data[config.key]}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
