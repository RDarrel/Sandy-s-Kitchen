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
import { Separator } from "@/components/ui/separator";
import { ToggleShowOrderDetails } from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { CheckCircle2 } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ReceiveOrderItemsTable from "./items-table";
import {
  getItemKey,
  getItemsFromPurchase,
  getOrderedQty,
  getTodayISO,
  getUnitCost,
  normalizeQtyInput,
  round2,
  toNumber,
} from "./utils";

const ReceiveOrderModal = () => {
  const dispatch = useDispatch();
  const { showOrderDetails, selected } = useSelector(
    ({ purchases }) => purchases,
  );

  const purchase = useMemo(() => selected ?? null, [selected]);

  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);
  const [receivedByKey, setReceivedByKey] = useState({});
  const [expiryByKey, setExpiryByKey] = useState({});
  const minExpiryDate = useMemo(() => getTodayISO(), []);

  useEffect(() => {
    if (!showOrderDetails) {
      setReceivedByKey({});
      setExpiryByKey({});
      return;
    }

    const initial = {};
    const initialExpiry = {};
    for (const item of items) {
      const key = getItemKey(item);
      if (!key) continue;
      initial[key] = normalizeQtyInput(getOrderedQty(item));
      initialExpiry[key] = "";
    }
    setReceivedByKey(initial);
    setExpiryByKey(initialExpiry);
  }, [items, showOrderDetails]);

  const close = (nextOpen) => {
    if (nextOpen) return;
    if (showOrderDetails) dispatch(ToggleShowOrderDetails());
  };

  const supplierName = purchase?.supplier?.name || "Supplier";

  const counts = useMemo(() => {
    const total = items.length;
    const flagged = items.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const expected = round2(getOrderedQty(item));
      const received = round2(toNumber(receivedByKey[key]));
      return sum + (round2(expected - received) !== 0 ? 1 : 0);
    }, 0);
    return { total, flagged };
  }, [items, receivedByKey]);

  const grandSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const unitCost = getUnitCost(item);
      if (unitCost === null) return sum;
      const received = round2(toNumber(receivedByKey[key]));
      return sum + Math.max(0, received) * unitCost;
    }, 0);
  }, [items, receivedByKey]);

  const grandVariance = useMemo(() => {
    return items.reduce((sum, item) => {
      const key = getItemKey(item);
      if (!key) return sum;
      const unitCost = getUnitCost(item);
      if (unitCost === null) return sum;
      const expected = round2(getOrderedQty(item));
      const received = round2(toNumber(receivedByKey[key]));
      return sum + (received - expected) * unitCost;
    }, 0);
  }, [items, receivedByKey]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!items.length) {
      toast.error("No items to receive.");
      return;
    }

    toast.success("Saved received quantities (UI only).");
    close(false);
  };

  return (
    <Dialog open={showOrderDetails} onOpenChange={close}>
      <DialogContent className="border-border bg-card p-0 sm:max-w-5xl">
        <form onSubmit={handleSubmit}>
          <div className="flex max-h-[calc(100vh-6rem)] min-h-0 flex-col overflow-hidden">
            <DialogHeader className="gap-2 px-6 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl text-foreground">
                    Receive order
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Verify quantities received from {supplierName}.
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {counts.total} item{counts.total === 1 ? "" : "s"}
                  </Badge>
                  <Badge
                    variant={counts.flagged ? "destructive" : "outline"}
                    className={!counts.flagged ? "text-muted-foreground" : ""}
                  >
                    {counts.flagged
                      ? `${counts.flagged} mismatch`
                      : "All matched"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-auto">
              <Separator />

              <div className="bg-muted/10 px-6 py-5">
                {!items.length ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-muted-foreground">
                    No items found for this order.
                  </div>
                ) : (
                  <ReceiveOrderItemsTable
                    items={items}
                    receivedByKey={receivedByKey}
                    setReceivedByKey={setReceivedByKey}
                    expiryByKey={expiryByKey}
                    setExpiryByKey={setExpiryByKey}
                    minExpiryDate={minExpiryDate}
                    counts={counts}
                    grandSubtotal={grandSubtotal}
                    grandVariance={grandVariance}
                  />
                )}
              </div>
            </div>

            <Separator />

            <DialogFooter className="gap-2 px-6 py-4 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => close(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Save received (UI only)
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ReceiveOrderModal);
