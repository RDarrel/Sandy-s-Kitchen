import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowDownToLine,
  BarChart3,
  Loader2,
  Tags,
  UtensilsCrossed,
} from "lucide-react";
import { endOfMonth, format, startOfYear } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/shared/datePicker";
import { GET_ANALYTICS } from "@/services/redux/slices/report/pos";
import { formatAnalytics } from "./data";
import SalesChart from "./chart";
import Summary from "./summary";
import RankingCard from "./RankingCard";
import AnalyticsSkeleton from "./Skeleton";
import posAnalyticsToExcel from "@/services/utilities/export/excel/posAnalyticsToExcel";
import fullName from "@/services/utilities/fullName";

const panel = "min-w-0 rounded-2xl border border-border bg-card shadow-sm";
const rankings = [
  {
    key: "dishes", title: "Best-Selling Dishes",
    subtitle: "Dishes ranked by quantity sold within the selected period.",
    label: "Dish", icon: UtensilsCrossed,
    tone: "bg-primary/10 text-primary", bar: "bg-primary",
  },
  {
    key: "categories", title: "Sales by Category",
    subtitle: "Menu categories ranked by total sales within the selected period.",
    label: "Category", icon: Tags,
    tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300", bar: "bg-amber-500",
  },
];

const Analytics = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth?.auth);
  const { analytics, analyticsRequestId, message } = useSelector(
    ({ posReport }) => posReport,
  );
  const loading = Boolean(analyticsRequestId);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return { from: startOfYear(today), to: endOfMonth(today) };
  });
  const [metric, setMetric] = useState("value");
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

  const handleExport = async () => {
    if (exporting || loading || message) return;
    setExporting(true);
    try {
      await posAnalyticsToExcel({
        data,
        options: {
          date,
          metric,
          createdBy:
            typeof auth?.fullName === "string"
              ? auth.fullName
              : auth?.fullName
                ? fullName(auth.fullName)
                : "Administrator",
        },
      });
      toast.success("POS analytics exported.");
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
              POS Analytics
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Analyze POS sales trends, best-selling dishes, and sales by category
              within the selected period.
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
              Export to Excel
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
                    <h2 className="font-semibold">Sales Trends</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Track POS sales and order counts over the selected period.
                    </p>
                  </div>
                </div>
                <div
                  className="inline-flex w-fit gap-1 rounded-lg border border-border/60 bg-muted/50 p-1"
                  role="group"
                  aria-label="Chart metric"
                >
                  {[
                    ["value", "Sales"],
                    ["orders", "Orders"],
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
              <SalesChart data={data.monthly} metric={metric} />
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
