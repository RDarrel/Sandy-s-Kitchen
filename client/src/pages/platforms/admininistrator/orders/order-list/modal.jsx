import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ToggleShowOrderDetails } from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { CheckCircle2, Package } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];

  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];

  return Array.isArray(items) ? items : [];
};

const getItemKey = (item) =>
  String(item?._id || item?.inventory?._id || item?.inventory || item?.name);

const getIncomingQty = (item) => {
  const incoming = item?.quantity?.incoming;
  if (incoming !== undefined && incoming !== null) return Number(incoming) || 0;
  return Number(item?.quantity) || 0;
};

const ReceiveOrderModal = () => {
  const dispatch = useDispatch();
  const { showOrderDetails, selected } = useSelector(
    ({ purchases }) => purchases,
  );

  const purchase = useMemo(() => selected ?? null, [selected]);

  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const [receivedByKey, setReceivedByKey] = useState({});

  useEffect(() => {
    if (!showOrderDetails) {
      setReceivedByKey({});
      return;
    }

    const initial = {};
    for (const item of items) {
      const key = getItemKey(item);
      if (!key) continue;
      initial[key] = getIncomingQty(item);
    }
    setReceivedByKey(initial);
  }, [items, showOrderDetails]);

  const close = (nextOpen) => {
    if (nextOpen) return;
    if (showOrderDetails) dispatch(ToggleShowOrderDetails());
  };

  const supplierName = purchase?.supplier?.name || "Supplier";
  const purchaseId = String(purchase?._id || "");
  const status = String(purchase?.status || "incoming");

  const counts = useMemo(() => {
    const total = items.length;
    const flagged = items.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const expected = getIncomingQty(item);
      const received = Number(receivedByKey[key]) || 0;
      return sum + (received > expected ? 1 : 0);
    }, 0);
    return { total, flagged };
  }, [items, receivedByKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.message("Design only", {
      description: "Saving received quantities is not wired yet.",
    });
  };

  return (
    <Dialog open={showOrderDetails} onOpenChange={close}>
      <DialogContent className="p-0 sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="flex max-h-[85vh] flex-col">
          <DialogHeader className="space-y-2 px-6 pb-4 pt-6 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg">Receive order</DialogTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {counts.total} item(s)
                  </Badge>
                  {counts.flagged ? (
                    <Badge className="rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15">
                      {counts.flagged} over expected
                    </Badge>
                  ) : null}
                </div>
                <DialogDescription className="text-sm leading-snug">
                  Type the actual quantity received per item (kg / L / pcs). This
                  is UI-only for now.
                </DialogDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {purchaseId ? (
                  <Badge variant="outline" className="rounded-full">
                    #{purchaseId.slice(-6).toUpperCase()}
                  </Badge>
                ) : null}
                <Badge variant="secondary" className="rounded-full">
                  {capitalize(status)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Supplier
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {supplierName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Total amount
                </p>
                <p className="truncate text-sm font-semibold tabular-nums text-foreground">
                  {Formatter.amount(purchase?.totalAmount || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Delivery window
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {purchase?.deliveryWindow?.from && purchase?.deliveryWindow?.to
                    ? `${Formatter.date(purchase.deliveryWindow.from)} - ${Formatter.date(purchase.deliveryWindow.to)}`
                    : purchase?.deliveryWindow?.from
                      ? Formatter.date(purchase.deliveryWindow.from)
                      : "Not set"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!items.length ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-muted-foreground">
                No items found for this order.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card/40">
                <div className="grid grid-cols-[1fr_120px_150px] gap-2 border-b border-border/70 bg-muted/20 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                  <span className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    Item
                  </span>
                  <span className="pl-2">Expected</span>
                  <span>Received</span>
                </div>

                <div className="divide-y divide-border/70">
                  {items.map((item) => {
                    const key = getItemKey(item);
                    const name =
                      item?.inventory?.name || item?.name || "Item";
                    const unit = capitalize(item?.unit) || "";
                    const expected = getIncomingQty(item);
                    const received = Number(receivedByKey[key]) || 0;
                    const isOver = received > expected;

                    return (
                      <div
                        key={key || name}
                        className="grid grid-cols-[1fr_120px_150px] items-start gap-2 px-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Unit:{" "}
                            <span className="font-medium text-foreground/80">
                              {unit || "-"}
                            </span>
                          </p>
                        </div>

                        <div className="pl-2 pt-0.5 font-semibold tabular-nums text-foreground">
                          {expected}{" "}
                          {unit ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              {unit}
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1">
                          <Label className="sr-only" htmlFor={`received-${key}`}>
                            Received quantity
                          </Label>
                          <div className="relative">
                            <Input
                              id={`received-${key}`}
                              type="number"
                              min={0}
                              step="0.01"
                              inputMode="decimal"
                              value={Number.isFinite(received) ? received : ""}
                              onChange={(event) => {
                                const raw = event.target.value;
                                setReceivedByKey((prev) => ({
                                  ...prev,
                                  [key]: raw === "" ? "" : Number(raw),
                                }));
                              }}
                              className={`h-9 pr-14 tabular-nums ${isOver ? "border-destructive/60 focus-visible:ring-destructive/30" : ""}`}
                            />
                            {unit ? (
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                {unit}
                              </span>
                            ) : null}
                          </div>
                          {isOver ? (
                            <p className="text-xs text-destructive">
                              Received exceeds expected.
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Remaining:{" "}
                              <span className="font-medium tabular-nums text-foreground/80">
                                {Math.max(0, expected - received)}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <DialogFooter className="gap-2 px-6 py-4 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Save received (UI only)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ReceiveOrderModal);
