import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/services/utilities";
import {
  CalendarDays,
  CreditCard,
  PhilippinePeso,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Summary = ({ errors }) => {
  const { isLoadingSummary, summary } = useSelector(
    ({ dashboard }) => dashboard,
  );
  const {
    trends: summaryTrends = [],
    totalCollections = 0,
    bookingCollections = 0,
    outstandingBalance = 0,
    bookingsWithBalance = 0,
    posSales = 0,
    posTransactions = 0,
    verifiedPayments = 0,
  } = summary;

  const money = (value) => Formatter.amount(value);

  return (
    <section
      aria-label="Business performance"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Metric
        isLoading={isLoadingSummary}
        showTrend
        title="Total Collections"
        value={errors.summary ? "—" : money(totalCollections)}
        icon={PhilippinePeso}
        featured
        description="Booking + POS"
        detail="Total payments received"
        points={summaryTrends.map((entry) => Number(entry.total ?? 0))}
        to="/platforms/dashboard"
      />
      <Metric
        isLoading={isLoadingSummary}
        showTrend
        title="Booking Collections"
        value={errors.summary ? "—" : money(bookingCollections)}
        icon={CalendarDays}
        description={`${verifiedPayments} verified payments`}
        detail="Payments from bookings"
        points={summaryTrends.map((entry) => Number(entry.booking ?? 0))}
        to="/platforms/reports/booking/payments"
      />
      <Metric
        isLoading={isLoadingSummary}
        showTrend
        title="POS Sales"
        value={errors.summary ? "—" : money(posSales)}
        icon={ShoppingBag}
        gold
        description={`${posTransactions} transactions`}
        detail="Sales from POS orders"
        points={summaryTrends.map((entry) => Number(entry.pos ?? 0))}
        to="/platforms/reports/pos/sales"
      />
      <Metric
        isLoading={isLoadingSummary}
        title="Outstanding Balance"
        value={errors.summary ? "—" : money(outstandingBalance)}
        icon={CreditCard}
        gold
        description={`${Number(bookingsWithBalance ?? 0)} bookings with balance`}
        detail="Unpaid booking balances"
        points={[]}
        to="/platforms/reports/booking/sales"
      />
    </section>
  );
};

export default Summary;

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
          {isLoading ? (
            <Skeleton aria-label="Loading amount" className="h-9 w-36" />
          ) : (
            value
          )}
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
          <svg
            viewBox="0 0 104 36"
            className="h-6 w-[72px] shrink-0 animate-pulse text-skeleton motion-reduce:animate-none"
            aria-hidden="true"
          >
            <polygon
              points="4,36 4,27 20,19 36,23 52,12 68,17 84,7 100,13 100,36"
              fill="currentColor"
              opacity="0.35"
            />
            <polyline
              points="4,27 20,19 36,23 52,12 68,17 84,7 100,13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="100" cy="13" r="2.5" fill="currentColor" />
          </svg>
        )}
        {!isLoading && points.length > 1 && (
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
        )}
      </div>
    </Link>
  );
};
