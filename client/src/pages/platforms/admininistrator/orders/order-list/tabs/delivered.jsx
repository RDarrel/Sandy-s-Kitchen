import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Formatter } from "@/services/utilities";
import { CalendarRange, ChevronDown, Package, PackageCheck } from "lucide-react";
import { memo, useMemo, useState } from "react";

const statusMeta = {
  received: {
    label: "Received",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
  },
  resolved: {
    label: "Resolved",
    className: "border-secondary/40 bg-secondary/40 text-secondary-foreground",
  },
  refunded: {
    label: "Refunded",
    className: "border-accent/40 bg-accent/20 text-accent-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-destructive/40 bg-destructive/10 text-foreground",
  },
};

const OrderSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  </div>
);

const ReceivedOrdersTab = ({ orders = [], isLoading }) => {
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const [openById, setOpenById] = useState({});

  if (isLoading) {
    return (
      <div className="space-y-3">
        <OrderSkeleton />
        <OrderSkeleton />
        <OrderSkeleton />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No received orders yet
          </p>
          <p className="text-xs text-muted-foreground">
            Completed supplier orders will appear here once recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((purchase) => {
        const statusKey = String(purchase?.status || "received").toLowerCase();
        const meta = statusMeta[statusKey] || statusMeta.received;

        const purchaseId = String(purchase?._id || "");
        const isOpen = Boolean(openById[purchaseId]);
        const itemsCount = Number(purchase?.itemsCount) || 0;
        const items = Array.isArray(purchase?.items) ? purchase.items : [];

        const supplierName =
          purchase?.supplier?.name ||
          purchase?.supplier?.company ||
          purchase?.supplier?.label ||
          "Supplier";

        const deliveryFrom = purchase?.deliveryWindow?.from;
        const deliveryTo = purchase?.deliveryWindow?.to;
        const deliveryLabel =
          deliveryFrom && deliveryTo
            ? `${Formatter.date(deliveryFrom)} – ${Formatter.date(deliveryTo)}`
            : deliveryFrom
              ? Formatter.date(deliveryFrom)
              : "Not set";

        const receivedAt =
          purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

        return (
          <div
            key={purchase?._id || supplierName}
            className="rounded-xl border border-border bg-card/60 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-foreground">
                    {supplierName}
                  </p>
                  <Badge
                    variant="outline"
                    className={`rounded-full ${meta.className}`}
                  >
                    <PackageCheck className="h-3 w-3" />
                    {meta.label}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0 text-[11px]"
                    title="Number of items in this order"
                  >
                    <Package className="h-3 w-3" />
                    {itemsCount} item(s)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Order ID:{" "}
                  <span className="font-medium text-foreground/90">
                    {String(purchase?._id || "—").slice(-8)}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-start gap-1 sm:items-end">
                <p className="text-xs text-muted-foreground">Total amount</p>
                <p className="text-base font-semibold tabular-nums text-foreground">
                  {Formatter.amount(purchase?.totalAmount || 0)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg bg-background/40 p-3 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Delivery window</p>
                  <p className="truncate font-medium text-foreground">
                    {deliveryLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Recorded</p>
                  <p className="truncate font-medium text-foreground">
                    {receivedAt ? Formatter.date(receivedAt) : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Summary</p>
                  <p className="truncate font-medium text-foreground">
                    Completed and archived for reference.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Collapsible
                open={isOpen}
                onOpenChange={(next) =>
                  setOpenById((prev) => ({ ...prev, [purchaseId]: next }))
                }
              >
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    >
                      View items
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <span className="text-xs text-muted-foreground">
                    {itemsCount ? `${itemsCount} item(s)` : "No items found"}
                  </span>
                </div>

                <CollapsibleContent className="mt-2">
                  {items.length ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                      <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                        <span>Item</span>
                        <span className="text-right">Qty</span>
                      </div>
                      <div className="divide-y divide-border/70">
                        {items.map((item) => (
                          <div
                            key={item?._id || item?.name}
                            className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-sm"
                          >
                            <span className="truncate font-medium text-foreground">
                              {item?.name || "Item"}
                            </span>
                            <span className="text-right font-semibold tabular-nums text-foreground">
                              {Number(item?.quantity?.order) || 0}{" "}
                              <span className="text-xs font-medium text-muted-foreground">
                                {item?.unit || ""}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                      Items for this order aren&apos;t available yet (older orders
                      may have been created before item tracking was added).
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default memo(ReceivedOrdersTab);

