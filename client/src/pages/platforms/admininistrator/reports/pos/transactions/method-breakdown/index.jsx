import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";
import { format, isValid } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/services/utilities";
import { BROWSE } from "@/services/redux/slices/events/paymentMethods";

import PaymentMethodLogo from "../../../../paymentMethods/method/logo";
import { getMethodBreakdown } from "./utils";

const TYPE_META = {
  cash: { label: "Cash", icon: Banknote },
  e_wallet: { label: "E-wallet", icon: Smartphone },
  bank_transfer: { label: "Bank transfer", icon: Building2 },
};

const MethodBreakdown = ({ transactions, isLoading, error, date }) => {
  const dispatch = useDispatch();

  const {
    collections = [],
    isLoading: loadingMethods,
    message,
  } = useSelector(({ paymentMethods }) => paymentMethods);

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const { total, count, breakdown } = useMemo(
    () => getMethodBreakdown(transactions, collections),
    [transactions, collections],
  );

  const loading = isLoading || loadingMethods;

  const methodsByUsage = useMemo(
    () =>
      [...breakdown].sort((a, b) => b.count - a.count || b.amount - a.amount),
    [breakdown],
  );

  return (
    <Card className="min-w-0 gap-0 overflow-hidden border-border py-0 shadow-sm">
      <CardHeader className="gap-1 px-4 py-4">
        <CardTitle className="text-base leading-tight">
          Payment Method Breakdown
        </CardTitle>

        <p className="text-xs text-muted-foreground">
          {isValid(date?.from) && isValid(date?.to)
            ? `${format(date.from, "MMM dd, yyyy")} – ${format(date.to, "MMM dd, yyyy")}`
            : "Select a report period"}
        </p>
      </CardHeader>

      <CardContent className="px-4 pb-4" aria-busy={loading}>
        {loading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">Loading payment method breakdown...</span>

            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-md" />
            ))}

            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ) : error ? (
          <p role="status" className="text-xs text-muted-foreground">
            Unable to load the payment method breakdown. Please try again.
          </p>
        ) : (
          <>
            {/* Total Collected */}
            <div className="mb-2 rounded-md bg-muted/40 px-3 py-3">
              <p className="text-sm font-medium text-muted-foreground">
                Total Collected
              </p>

              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="min-w-0 break-words text-2xl font-bold tracking-tight text-primary tabular-nums">
                  {Formatter.amount(total)}
                </p>

                <p className="shrink-0 pb-0.5 text-xs text-muted-foreground">
                  {count} transaction{count === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Payment Method Warning */}
            {message && (
              <p role="status" className="mb-3 text-xs text-muted-foreground">
                Some payment method details are unavailable. Collection totals
                are still displayed.
              </p>
            )}

            {/* Empty State */}
            {count === 0 ? (
              <div
                role="status"
                className="rounded-md border border-dashed px-3 py-5 text-center"
              >
                <p className="text-xs font-medium">No Transactions Found</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  No transactions match the selected filters.
                </p>
              </div>
            ) : (
              /* Payment Methods */
              <div>
                <ul className="divide-y divide-border/60">
                  {methodsByUsage.map((method) => {
                    const meta = TYPE_META[method.type] || {
                      label: "Unspecified",
                      icon: CreditCard,
                    };

                    const usageShare = (method.count / count) * 100;

                    return (
                      <li key={method._id} className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {/* Payment Method Logo */}
                          <PaymentMethodLogo
                            method={method}
                            fallbackIcon={meta.icon}
                            className="size-10 rounded-md p-1"
                          />

                          {/* Payment Method Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p
                                className="truncate text-sm font-medium"
                                title={`${method.name} (${meta.label})`}
                              >
                                {method.name}
                              </p>

                              <p className="shrink-0 text-sm font-semibold tabular-nums">
                                {Formatter.amount(method.amount)}
                              </p>
                            </div>

                            {/* Transaction Count and Percentage */}
                            <div className="mt-0.5 flex justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                              <span>
                                {method.count} transaction
                                {method.count === 1 ? "" : "s"}
                              </span>

                              <span>{usageShare.toFixed(1)}%</span>
                            </div>

                            {/* Payment Method Usage */}
                            <div
                              role="progressbar"
                              aria-label={`${method.name}: share of total transactions`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={Number(usageShare.toFixed(1))}
                              aria-valuetext={`${method.count} of ${count} transactions (${usageShare.toFixed(1)}%)`}
                              className="mt-1.5 h-1 overflow-hidden rounded-full bg-primary/10"
                            >
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${usageShare}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MethodBreakdown;
