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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const getOrderedQty = (item) => {
  const requested = item?.quantity?.request;
  if (requested !== undefined && requested !== null)
    return Number(requested) || 0;

  const incoming = item?.quantity?.incoming;
  if (incoming !== undefined && incoming !== null) return Number(incoming) || 0;

  return Number(item?.quantity) || 0;
};

const formatQty = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
};

const normalizeQtyInput = (value) => {
  const number = round2(Number(value));
  if (!Number.isFinite(number)) return "";
  if (Number.isInteger(number)) return String(number);

  return String(number.toFixed(2)).replace(/0+$/, "").replace(/\.$/, "");
};

const round2 = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getUnitCost = (item) => {
  const raw = item?.cost ?? item?.inventory?.cost ?? item?.inventory?.price;
  const number = Number(raw);
  return Number.isFinite(number) ? number : null;
};

const getTodayISO = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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
      const discrepancy = round2(expected - received);
      return sum + discrepancy * unitCost;
    }, 0);
  }, [items, receivedByKey]);

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.message("Not saved yet", {
      description:
        "This screen is ready, but saving is not wired to the server.",
    });
  };

  return (
    <Dialog open={showOrderDetails} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] w-[95vw] overflow-y-auto p-0 sm:max-w-5xl lg:max-w-7xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-2 border-b border-border px-6 pb-4 pt-6 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-lg">
                    Receive supplier delivery
                  </DialogTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {counts.total} item(s)
                  </Badge>
                  {counts.flagged ? (
                    <Badge className="rounded-full bg-destructive/15 text-destructive hover:bg-destructive/15">
                      {counts.flagged} mismatch
                    </Badge>
                  ) : null}
                </div>
                <DialogDescription className="text-sm leading-snug">
                  Confirm items delivered by the supplier. Enter received
                  quantities and expiry dates (optional).
                </DialogDescription>
              </div>

              {/* header badges removed; keep only dialog close icon */}
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
                  {purchase?.deliveryWindow?.from &&
                  purchase?.deliveryWindow?.to
                    ? `${Formatter.date(purchase.deliveryWindow.from)} - ${Formatter.date(purchase.deliveryWindow.to)}`
                    : purchase?.deliveryWindow?.from
                      ? Formatter.date(purchase.deliveryWindow.from)
                      : "Not set"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="bg-muted/10 px-6 py-5">
            {!items.length ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-muted-foreground">
                No items found for this order.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <Table className="min-w-[980px]">
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-muted/30">
	                      <TableHead className="sticky top-0 z-10 bg-muted/30 px-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
	                        <span className="flex items-center gap-2">
	                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
	                          Item
	                        </span>
	                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/30 px-5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Ordered qty
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-[280px] bg-muted/30 px-5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Received qty
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/30 px-5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Expiry date
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 w-[220px] bg-muted/30 px-5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                        Short qty
                      </TableHead>
                    </TableRow>
                  </TableHeader>

	                  <TableBody>
	                    {items.map((item) => {
	                      const key = getItemKey(item);
	                      const name =
	                        item?.inventory?.name || item?.name || "Item";
	                      const unitRaw = String(item?.unit || "").trim();
	                      const unit = capitalize(unitRaw) || "";
	                      const expected = round2(getOrderedQty(item));
	                      const received = round2(toNumber(receivedByKey[key]));
	                      const discrepancy = round2(expected - received);
	                      const hasMismatch = discrepancy !== 0;
	                      const isOver = discrepancy < 0;
	                      const shortQty = Math.max(0, discrepancy);
	                      const unitCost = getUnitCost(item);
	                      const shortAmount =
	                        unitCost === null ? null : Math.max(0, shortQty) * unitCost;
	                      const receivedAmount =
	                        unitCost === null
	                          ? null
	                          : Math.max(0, received) * unitCost;

	                      const inputHighlightClass = hasMismatch
	                        ? isOver
	                          ? "border-destructive/60 focus-visible:ring-destructive/20"
	                          : "border-accent/60 focus-visible:ring-accent/20"
	                        : "";

	                      return (
	                        <TableRow
	                          key={key || name}
	                          className={`hover:bg-muted/5 ${hasMismatch ? "bg-destructive/5" : ""}`}
	                        >
	                          <TableCell className="whitespace-normal px-5 py-2.5">
	                            <p className="truncate font-medium text-foreground">
	                              {name}
	                            </p>
	                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
	                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground/80">
	                                {unit || "-"}
	                              </span>
	                              {unitCost === null ? (
	                                <span>Unit cost: -</span>
	                              ) : (
	                                <span>
	                                  Unit cost:{" "}
	                                  <span className="font-medium text-foreground/80">
	                                    {Formatter.amount(unitCost)}
	                                  </span>
	                                </span>
	                              )}
	                            </div>
	                          </TableCell>

		                          <TableCell className="px-5 py-2.5 text-right font-semibold tabular-nums text-foreground">
		                            {formatQty(expected)}{" "}
		                            <span className="text-xs font-medium text-muted-foreground">
		                              {unit || "-"}
		                            </span>
		                          </TableCell>
		
                          <TableCell className="w-[280px] px-5 py-2.5">
                            <div className="flex flex-col items-center gap-1">
		                              <Label
		                                className="sr-only"
		                                htmlFor={`received-${key}`}
		                              >
		                                Received quantity
		                              </Label>
                              <div className="relative w-[140px]">
                                <Input
                                  id={`received-${key}`}
		                                  type="text"
		                                  min={0}
	                                  step="0.01"
	                                  inputMode="decimal"
	                                  value={receivedByKey[key] ?? ""}
	                                  onChange={(event) => {
	                                    const raw = event.target.value;
	                                    setReceivedByKey((prev) => ({
	                                      ...prev,
	                                      [key]: raw,
	                                    }));
	                                  }}
	                                  onBlur={(event) => {
	                                    const raw = event.target.value;
	                                    setReceivedByKey((prev) => ({
	                                      ...prev,
	                                      [key]: normalizeQtyInput(raw),
	                                    }));
                                  }}
                                  placeholder="0"
                                  className={`h-8 w-full bg-background pr-12 text-right tabular-nums ${inputHighlightClass}`}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                  {unit || "-"}
                                </span>
                              </div>

                              <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                                <span className="font-medium">Total amount</span>
                                <span className="font-semibold tabular-nums text-foreground">
                                  {receivedAmount === null
                                    ? "-"
                                    : Formatter.amount(receivedAmount)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
	
                          <TableCell className="px-5 py-2.5">
                            <div className="mx-auto w-[150px]">
		                              <Label
		                                className="sr-only"
	                                htmlFor={`expiry-${key}`}
	                              >
	                                Expiration date
	                              </Label>
	                              <Input
	                                id={`expiry-${key}`}
	                                type="date"
	                                min={minExpiryDate}
	                                value={expiryByKey[key] ?? ""}
	                                onChange={(event) => {
	                                  const raw = event.target.value;
	                                  setExpiryByKey((prev) => ({
	                                    ...prev,
	                                    [key]: raw,
	                                  }));
	                                }}
	                                className="h-8 w-full bg-background text-sm"
	                              />
                            </div>
                          </TableCell>

                          <TableCell className="w-[220px] px-5 py-2.5">
                            <div className="flex flex-col items-center gap-1">
                              <div className="relative w-[140px]">
                                <Input
                                  type="text"
                                  value={formatQty(shortQty)}
                                  disabled
                                  className={`h-8 w-full border-dashed bg-muted/20 pr-12 text-right font-semibold tabular-nums disabled:cursor-not-allowed disabled:opacity-100 ${shortQty > 0 ? "border-destructive/40 text-destructive" : "border-border/70 text-muted-foreground"}`}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                  {unit || "-"}
                                </span>
                              </div>
                              <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                                <span className="font-medium">Total amount</span>
                                <span
                                  className={`font-semibold tabular-nums ${shortQty > 0 ? "text-destructive" : "text-muted-foreground"}`}
                                >
                                  {shortAmount === null
                                    ? "-"
                                    : Formatter.amount(shortAmount)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                    {counts.flagged
                      ? `${counts.flagged} item(s) have a mismatch from the supplier order.`
                      : "All items match the supplier order."}
                  </div>
	                  <div className="flex items-baseline justify-between gap-6 sm:justify-end">
	                    <div className="text-right">
	                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
	                        Total received value
	                      </span>
	                      <div className="text-base font-semibold tabular-nums text-foreground">
	                        {Formatter.amount(grandSubtotal)}
	                      </div>
	                    </div>
	                    <div className="text-right">
	                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
	                        Total variance
	                      </span>
	                      <div
	                        className={`text-base font-semibold tabular-nums ${grandVariance === 0 ? "text-muted-foreground" : "text-destructive"}`}
	                      >
	                        {Formatter.amount(grandVariance)}
	                      </div>
	                    </div>
	                  </div>
	                </div>
              </div>
            )}
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ReceiveOrderModal);
