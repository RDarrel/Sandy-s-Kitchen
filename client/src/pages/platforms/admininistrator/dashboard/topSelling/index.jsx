import { ChevronRight, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DashboardEmptyState,
  DashboardFeedback,
  ReportLink,
} from "../components";
import { useDispatch, useSelector } from "react-redux";
import { GET_TOP_SELLING_ITEMS } from "@/services/redux/slices/dashboard";
import { capitalize, Formatter } from "@/services/utilities";
import { TopSellingItemsSkeleton } from "../skeletons";

const TopSelling = ({ startDate, endDate, errors, label }) => {
  const { isLoadingTopSelling, topSellingItems } = useSelector(
    ({ dashboard }) => dashboard,
  );
  const bestSellers = (topSellingItems || []).map((item) => ({
    id: item.menuId,
    name: capitalize(item.name),
    sold: Number(item.quantitySold ?? 0),
    amount: Number(item.totalSales ?? 0),
  }));

  const dispatch = useDispatch();
  return (
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
              <p className="text-xs leading-4 text-muted-foreground">{label}</p>
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
          <DashboardFeedback
            error={errors.topSellingItems}
            onRetry={() =>
              dispatch(GET_TOP_SELLING_ITEMS({ startDate, endDate }))
            }
          />
        ) : bestSellers.length ? (
          <>
            <div className="flex min-h-11 items-center justify-between gap-2 border-b py-3 text-[11px] text-muted-foreground">
              <span>Ranked by quantity sold</span>
              <span className="tabular-nums">{bestSellers.length} items</span>
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
                        {Formatter.amount(item.amount)}
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
  );
};

export default TopSelling;
