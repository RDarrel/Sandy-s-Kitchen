import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/services/utilities";
import { CalendarDays, CheckCircle2, FileText, Wallet } from "lucide-react";
import { useSelector } from "react-redux";

const Summary = () => {
  const { salesReport, isLoading } = useSelector(
    ({ bookingReport }) => bookingReport,
  );
  const { summary } = salesReport;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Booking Sales"
        value={Formatter.amount(summary?.totalBookingValue)}
        description={`Total value of eligible bookings`}
        icon={FileText}
        tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        isLoading={isLoading}
      />

      <SummaryCard
        title="Total Paid"
        value={Formatter.amount(summary?.totalPaidAmount)}
        description="Verified payments received"
        icon={CheckCircle2}
        tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        isLoading={isLoading}
      />

      <SummaryCard
        title="Outstanding Balance"
        value={Formatter.amount(summary?.outstandingBalance)}
        description="Remaining amount to collect"
        icon={Wallet}
        tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        isLoading={isLoading}
      />

      <SummaryCard
        title="Total Bookings"
        value={summary?.totalBookings}
        description="Confirmed, setup, and completed bookings"
        icon={CalendarDays}
        tone="bg-muted text-muted-foreground"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Summary;

const SummaryCard = ({ title, value, description, icon, tone, isLoading }) => {
  const Icon = icon;
  return (
    <div className="rounded-lg border bg-muted/10 px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-md p-1.5 ${tone}`}>
          <Icon className="size-3.5" aria-hidden="true" />
        </div>
      </div>
      {isLoading ? (
        <div role="status" aria-label={`Loading ${title}`}>
          <Skeleton className="mt-1 h-7 w-32 max-w-full" aria-hidden="true" />
          <Skeleton className="mt-0.5 h-4 w-28 max-w-full" aria-hidden="true" />
        </div>
      ) : (
        <>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </div>
  );
};
