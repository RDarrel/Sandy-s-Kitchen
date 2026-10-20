import { Boxes, ChevronRight } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardFeedback,
  ReportLink,
} from "../components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryOverviewSkeleton } from "../skeletons";
import { useDispatch, useSelector } from "react-redux";
import { capitalize, Stock } from "@/services/utilities";
import { GET_INVENTORY_OVERVIEW } from "@/services/redux/slices/dashboard";
import { mapInventoryItem } from "../data";
const Inventory = ({ errors }) => {
  const { inventoryOverview, isLoadingInventory } = useSelector(
    ({ dashboard }) => dashboard,
  );
  const dispatch = useDispatch();
  const inventoryAlerts = (inventoryOverview?.items || []).map(
    mapInventoryItem,
  );
  const lowStockCount = Number(inventoryOverview?.statusCounts?.lowStock ?? 0);
  const outOfStockCount = Number(
    inventoryOverview?.statusCounts?.outOfStock ?? 0,
  );
  return (
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
      {isLoadingInventory ? (
        <InventoryOverviewSkeleton />
      ) : errors.inventoryOverview ? (
        <DashboardFeedback
          error={errors.inventoryOverview}
          onRetry={() => dispatch(GET_INVENTORY_OVERVIEW())}
        />
      ) : inventoryAlerts.length ? (
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
                    item.reorder > 0 ? (item.quantity / item.reorder) * 100 : 0,
                  ),
                );
                const isOutOfStock = item.quantity <= 0;
                return (
                  <li key={item.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-5">
                          {capitalize(item.name)}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 tabular-nums text-muted-foreground">
                          Reorder at {Stock.format(item.reorder)} {item.unit}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold leading-5 tabular-nums">
                          {Stock.format(item.quantity)} {item.unit}
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
  );
};

export default Inventory;
