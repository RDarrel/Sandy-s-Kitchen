import CustomPagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter, fullName } from "@/services/utilities";
import { ChevronDown, Package, PackageCheck, UserRound } from "lucide-react";
import { memo, useMemo, useState } from "react";
import DeliveredSkeleton from "./skeleton";
import { useSelector } from "react-redux";
import { capitalize } from "lodash";

const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];

  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];

  return Array.isArray(items) ? items : [];
};

const formatReceivedBy = (receivedBy) => {
  if (!receivedBy) return "—";
  if (typeof receivedBy === "string") return receivedBy.slice(-8);

  if (receivedBy?.fullName && typeof receivedBy.fullName === "object") {
    return fullName(receivedBy.fullName);
  }

  if (typeof receivedBy === "object" && receivedBy?.fname) {
    return fullName(receivedBy);
  }

  return (
    receivedBy?.name ||
    receivedBy?.username ||
    receivedBy?.email ||
    String(receivedBy?._id || "").slice(-8) ||
    "—"
  );
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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

const ReceivedOrdersTab = () => {
  const { filtered: orders, isLoading } = useSelector(
    ({ purchases }) => purchases,
  );
  const rows = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);
  const [openById, setOpenById] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  if (isLoading) {
    return <DeliveredSkeleton />;
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
        const items = getItemsFromPurchase(purchase);
        const itemsCount = Number(purchase?.itemsCount) || items.length;

        const supplierName =
          purchase?.supplier?.name ||
          purchase?.supplier?.company ||
          purchase?.supplier?.label ||
          "Supplier";

        const receivedAt =
          purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;
        const totals = items.reduce(
          (acc, item) => {
            const unitCost = Number(item?.cost ?? item?.inventory?.cost ?? 0);
            const orderedQty = Number(
              item?.quantity?.incoming ??
                item?.quantity?.order ??
                item?.quantity?.request ??
                0,
            );
            const receivedQty = Number(item?.quantity?.received ?? 0);

            const orderedAmount =
              Number.isFinite(unitCost) && Number.isFinite(orderedQty)
                ? unitCost * orderedQty
                : 0;
            const receivedAmount =
              Number.isFinite(unitCost) && Number.isFinite(receivedQty)
                ? unitCost * receivedQty
                : 0;

            acc.ordered += orderedAmount;
            acc.received += receivedAmount;
            return acc;
          },
          { ordered: 0, received: 0 },
        );
        const difference = totals.ordered - totals.received;

        return (
          <div
            key={purchase?._id || supplierName}
            className="rounded-xl border border-border bg-card/60 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
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
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  Address:{" "}
                  <span className="font-medium text-foreground/90">
                    {purchase?.supplier?.address
                      ? purchase.supplier.address
                      : "-"}
                  </span>
                </p>
              </div>

              <div className="grid w-full gap-3 sm:ml-auto sm:w-auto sm:grid-cols-3 sm:items-end sm:text-right">
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <p className="text-xs text-muted-foreground">Total ordered</p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {Formatter.amount(totals.ordered)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <p className="text-xs text-muted-foreground">
                    Total received
                  </p>
                  <p className="text-base font-semibold tabular-nums text-foreground">
                    {Formatter.amount(totals.received)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <p className="text-xs text-muted-foreground">Difference</p>
                  <p
                    className={`text-base font-semibold tabular-nums ${difference === 0 ? "text-muted-foreground" : "text-destructive"}`}
                  >
                    {Formatter.amount(difference)}
                  </p>
                </div>
              </div>
            </div>

            {itemsCount ? (
              <Collapsible
                open={isOpen}
                onOpenChange={(next) =>
                  setOpenById((prev) => ({ ...prev, [purchaseId]: next }))
                }
              >
                <div className="mt-4 text-sm p-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Received by
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {formatReceivedBy(purchase?.received?.by)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto w-full justify-start p-0 text-left hover:bg-transparent"
                          >
                            <span className="min-w-0">
                              <span className="block text-xs text-muted-foreground">
                                Items received
                              </span>
                              <span className="flex min-w-0 items-center gap-1 font-semibold leading-none tabular-nums text-foreground">
                                <span className="truncate leading-none">
                                  {itemsCount} item(s)
                                </span>
                                <ChevronDown
                                  className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                              </span>
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Received date
                        </p>
                        <p className="truncate font-semibold text-foreground">
                          {formatDateTime(receivedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <CollapsibleContent className="mt-2">
                  {items.length ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                      <div className="grid grid-cols-[1fr_150px_150px_170px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                        <span>Item</span>
                        <span>Received Qty</span>
                        <span>Expiration Date</span>
                        <span>Short Qty</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        <div className="divide-y divide-border/70">
                          {items.map((item) =>
                            (() => {
                              const receivedQty = Number(
                                item?.quantity?.received ?? 0,
                              );
                              const incomingQty = Number(
                                item?.quantity?.incoming ??
                                  item?.quantity?.order ??
                                  item?.quantity?.request ??
                                  0,
                              );
                              const shortQty = Math.max(
                                0,
                                (Number.isFinite(incomingQty)
                                  ? incomingQty
                                  : 0) -
                                  (Number.isFinite(receivedQty)
                                    ? receivedQty
                                    : 0),
                              );

                              return (
                                <div
                                  key={
                                    item?._id ||
                                    item?.inventory?._id ||
                                    item?.name
                                  }
                                  className="grid grid-cols-[1fr_150px_150px_170px] items-center gap-2 px-3 py-2 text-sm"
                                >
                                  <span className="truncate font-medium text-foreground">
                                    {item?.inventory?.name ||
                                      item?.name ||
                                      "Item"}
                                  </span>
                                  <span className=" font-semibold tabular-nums text-foreground">
                                    {Number.isFinite(receivedQty)
                                      ? receivedQty
                                      : 0}{" "}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {capitalize(item?.unit) || ""}
                                    </span>
                                  </span>
                                  <span className=" text-xs font-medium text-muted-foreground">
                                    {item?.expirationDate
                                      ? Formatter.date(item.expirationDate)
                                      : "—"}
                                  </span>
                                  <span className="font-semibold tabular-nums text-foreground">
                                    {shortQty ? shortQty : "—"}{" "}
                                    <span className="text-xs font-medium text-muted-foreground">
                                      {shortQty ? capitalize(item?.unit) : ""}
                                    </span>
                                  </span>
                                </div>
                              );
                            })(),
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs text-muted-foreground">
                      Items for this order aren&apos;t available yet (older
                      orders may have been created before item tracking was
                      added).
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ) : null}
          </div>
        );
      })}
      <CustomPagination
        title="Received order"
        datas={orders}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />
    </div>
  );
};

export default memo(ReceivedOrdersTab);
