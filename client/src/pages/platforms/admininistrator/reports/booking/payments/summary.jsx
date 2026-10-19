import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { Clock3, CreditCard, Wallet, XCircle } from "lucide-react";
import { Formatter } from "@/services/utilities";

const Summary = () => {
  const { isLoading, paymentReport } = useSelector(
    ({ bookingReport }) => bookingReport,
  );

  const { summary } = paymentReport;

  const summaryCards = [
    {
      title: "Payments Collected",
      value: Formatter.amount(summary.totalCollected),
      description: `${summary.totalVerified ?? 0} verified payments`,
      icon: Wallet,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Pending Review",
      value: Formatter.amount(summary.pendingAmount),
      description: `${summary.totalPending ?? 0} pending payments`,
      icon: Clock3,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      title: "Voided Payments",
      value: Formatter.amount(summary.voidedAmount),
      description: `${summary.totalVoided ?? 0} voided payments`,
      icon: XCircle,
      tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      title: "Total Payments",
      value: summary.totalPayments ?? 0,
      description: "All recorded payment transactions",
      icon: CreditCard,
      tone: "bg-muted text-muted-foreground",
    },
  ];
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ title, value, description, icon, tone }) => {
          const Icon = icon;
          return (
            <div
              key={title}
              className="rounded-lg border bg-muted/10 px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {title}
                </p>
                <div className={`rounded-md p-1.5 ${tone}`}>
                  <Icon className="size-3.5" aria-hidden="true" />
                </div>
              </div>
              {isLoading ? (
                <div role="status" aria-label={`Loading ${title}`}>
                  <Skeleton
                    className="mt-1 h-7 w-32 max-w-full"
                    aria-hidden="true"
                  />
                  <Skeleton
                    className="mt-0.5 h-4 w-28 max-w-full"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Summary;
