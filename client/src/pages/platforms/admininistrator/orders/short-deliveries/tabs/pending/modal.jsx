import Spinner from "@/components/shared/spinner";
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
import {
  ToggleShortDeliveryActionModal,
  UPDATE,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter, fullName } from "@/services/utilities";
import { capitalize } from "lodash";
import {
  CalendarClock,
  HandCoins,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
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

const ShortDeliveryActionModal = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const {
    shortDeliveryActionOpen,
    shortDeliveryActionSelected,
    shortDeliveryActionType,
    formSubmitted,
  } = useSelector(({ purchases }) => purchases);

  const purchase = useMemo(
    () => shortDeliveryActionSelected ?? null,
    [shortDeliveryActionSelected],
  );
  const items = useMemo(() => getItemsFromPurchase(purchase), [purchase]);

  const [action, setAction] = useState(null);
  const resolvedAction = action || shortDeliveryActionType || "redelivery";

  const headerMeta = useMemo(() => {
    if (resolvedAction === "refunded") {
      return {
        title: "Refund short delivery",
        description:
          "You’re about to mark this short delivery as refunded. Review the details below, then confirm.",
      };
    }

    return {
      title: "Confirm redelivery",
      description:
        "You’re about to mark this short delivery for redelivery. Review the details below, then confirm.",
    };
  }, [resolvedAction]);

  const close = (nextOpen) => {
    if (nextOpen) return;
    if (shortDeliveryActionOpen) dispatch(ToggleShortDeliveryActionModal());
    setAction(null);
  };

  const supplierName =
    purchase?.supplier?.name ||
    purchase?.supplier?.company ||
    purchase?.supplier?.label ||
    "Supplier";

  const receivedAt =
    purchase?.received?.at || purchase?.updatedAt || purchase?.createdAt;

  const grandTotalAmount = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      const unitCostRaw = item?.cost ?? item?.inventory?.cost ?? 0;
      const unitCost = Number(unitCostRaw);
      const shortQty = Number(item?.quantity?.order ?? 0);
      if (!Number.isFinite(unitCost) || !Number.isFinite(shortQty)) return sum;
      return sum + unitCost * Math.max(0, shortQty);
    }, 0);
  }, [items]);

  const handleConfirm = async (nextStatus) => {
    const purchaseId = String(purchase?._id || "");
    if (!purchaseId) return;
    if (!token) return;

    try {
      await dispatch(
        UPDATE({
          token,
          data: {
            _id: purchaseId,
            status: nextStatus,
          },
        }),
      ).unwrap();

      toast.success(
        nextStatus === "refunded"
          ? "Marked as refunded successfully.. "
          : "Marked for redelivery successfully.",
      );
      dispatch(ToggleShortDeliveryActionModal());
      setAction(null);
    } catch (error) {
      toast.error("Failed to update short delivery.");
    }
  };

  return (
    <Dialog open={shortDeliveryActionOpen} onOpenChange={close}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-6xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base">{headerMeta.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {headerMeta.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-base font-semibold text-foreground">
                {supplierName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Address:{" "}
                <span className="font-medium text-foreground/90">
                  {purchase?.supplier?.address
                    ? purchase.supplier.address
                    : "-"}
                </span>
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <div className="flex items-end justify-start gap-3 sm:justify-end">
                <div className="flex flex-col items-start leading-none sm:items-end">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Total amount
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {Formatter.amount(grandTotalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-border bg-background/40 p-4 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Received by</p>
                <p className="truncate font-semibold text-foreground">
                  {formatReceivedBy(purchase?.received?.by)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Received date</p>
                <p className="truncate font-semibold text-foreground">
                  {formatDateTime(receivedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="truncate font-semibold text-foreground">
                  {items.length} item(s)
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card/40">
            <div className="grid grid-cols-[1.4fr_170px_140px_140px_160px_170px] gap-2 border-b border-border/70 bg-muted/20 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground/80">
              <span>Item</span>
              <span className="text-right">Cost / Unit</span>
              <span className="text-right">Ordered Qty</span>
              <span className="text-right">Received Qty</span>
              <span className="text-right">Short Qty</span>
              <span className="text-right">Total amount</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <div className="divide-y divide-border/70">
                {items.map((item) => {
                  const firstDelivery = Number(
                    item?.quantity?.firstDelivery ??
                      item?.quantity?.received ??
                      0,
                  );
                  const unitCostRaw = item?.cost ?? item?.inventory?.cost ?? 0;
                  const unitCost = Number(unitCostRaw);
                  const shortQty = Number(item?.quantity?.order ?? 0);
                  const orderedQty =
                    (Number.isFinite(firstDelivery) ? firstDelivery : 0) +
                    (Number.isFinite(shortQty) ? shortQty : 0);
                  const receivedQty =
                    orderedQty - (Number.isFinite(shortQty) ? shortQty : 0);
                  const totalAmount =
                    Number.isFinite(unitCost) && Number.isFinite(shortQty)
                      ? unitCost * Math.max(0, shortQty)
                      : null;

                  return (
                    <div
                      key={item?._id || item?.inventory?._id || item?.name}
                      className="grid grid-cols-[1.4fr_170px_140px_140px_160px_170px] items-center gap-2 px-3 py-2 text-sm"
                    >
                      <span className="truncate font-medium text-foreground">
                        {item?.inventory?.name || item?.name || "Item"}
                      </span>
                      <span className="text-right font-semibold tabular-nums text-foreground">
                        {Number.isFinite(unitCost)
                          ? `${Formatter.amount(unitCost)} / ${capitalize(item?.unit) || ""}`
                          : "—"}
                      </span>
                      <span className="text-right font-semibold tabular-nums text-foreground">
                        {Number.isFinite(orderedQty) ? orderedQty : 0}{" "}
                        <span className="text-xs font-medium text-muted-foreground">
                          {capitalize(item?.unit) || ""}
                        </span>
                      </span>
                      <span className="text-right font-semibold tabular-nums text-foreground">
                        {Number.isFinite(receivedQty) ? receivedQty : 0}{" "}
                        <span className="text-xs font-medium text-muted-foreground">
                          {capitalize(item?.unit) || ""}
                        </span>
                      </span>
                      <span className="inline-flex items-center justify-end gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-0.5 text-right font-semibold tabular-nums text-destructive">
                        {Number.isFinite(shortQty) ? shortQty : 0}
                        <span className="text-xs font-medium text-destructive/80">
                          {capitalize(item?.unit) || ""}
                        </span>
                      </span>
                      <span className="text-right font-semibold tabular-nums text-foreground">
                        {totalAmount === null
                          ? "—"
                          : Formatter.amount(totalAmount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setAction(null);
              dispatch(ToggleShortDeliveryActionModal());
            }}
            disabled={formSubmitted}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={resolvedAction === "refunded" ? "destructive" : "default"}
            disabled={!token || formSubmitted}
            onClick={() => handleConfirm(resolvedAction)}
          >
            {resolvedAction === "refunded" ? (
              <>
                <HandCoins className="h-4 w-4" />
                Confirm refund
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                Confirm redelivery
              </>
            )}
            <Spinner formSubmitted={formSubmitted} />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ShortDeliveryActionModal);
