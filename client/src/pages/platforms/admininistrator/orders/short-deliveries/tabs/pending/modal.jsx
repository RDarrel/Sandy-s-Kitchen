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
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  ToggleShortDeliveryActionModal,
  UPDATE,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter, fullName } from "@/services/utilities";
import { cn } from "@/lib/utils";
import { capitalize } from "lodash";
import {
  CalendarClock,
  CalendarIcon,
  HandCoins,
  ReceiptText,
  Truck,
  UserRound,
} from "lucide-react";
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

const formatReceivedBy = (receivedBy) => {
  if (!receivedBy) return "â€”";
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
    "â€”"
  );
};

const formatDateTime = (value) => {
  if (!value) return "â€”";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "â€”";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (date) => {
  if (!date) return null;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(date))
    .replace(/\//g, "-");
};

const getDefaultDeliveryWindow = () => {
  const now = new Date();

  const from = new Date(now);
  from.setDate(from.getDate() + 1);

  const to = new Date(now);
  to.setDate(to.getDate() + 3);

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
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
  const [deliveryWindow, setDeliveryWindow] = useState(getDefaultDeliveryWindow);

  useEffect(() => {
    if (!shortDeliveryActionOpen) return;
    setDeliveryWindow(getDefaultDeliveryWindow());
  }, [shortDeliveryActionOpen]);

  const headerMeta = useMemo(() => {
    if (resolvedAction === "refunded") {
      return {
        title: "Refund short delivery",
        description:
          "You're about to mark this short delivery as refunded. Review the details below, then confirm.",
      };
    }

    return {
      title: "Confirm redelivery",
      description:
        "You're about to mark this short delivery for redelivery. Review the details below, then confirm.",
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

    if (nextStatus === "redelivery") {
      if (!(deliveryWindow?.from && deliveryWindow?.to)) {
        toast.error("Please set a delivery period.");
        return;
      }
    }

    try {
      await dispatch(
        UPDATE({
          token,
          data: {
            _id: purchaseId,
            status: nextStatus,
            ...(nextStatus === "redelivery" && {
              deliveryWindow: {
                from: deliveryWindow?.from,
                to: deliveryWindow?.to,
              },
            }),
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
                          : "â€”"}
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
                          ? "â€”"
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

		        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		          {resolvedAction === "redelivery" ? (
		            <div className="flex w-full items-center gap-3 sm:w-auto">
		              <Label className="whitespace-nowrap text-xs text-muted-foreground">
		                Delivery period
		              </Label>
		              <Popover>
		                <PopoverTrigger asChild>
		                  <Button
		                    type="button"
		                    variant="outline"
		                    className={cn(
		                      "h-10 w-full justify-start gap-2 text-left font-normal sm:w-[360px]",
		                    )}
		                  >
	                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {deliveryWindow?.from ? (
                      deliveryWindow?.to ? (
                        <>
                          {Formatter.date(deliveryWindow.from)} –{" "}
                          {Formatter.date(deliveryWindow.to)}
                        </>
                      ) : (
                        <>{Formatter.date(deliveryWindow.from)}</>
                      )
                    ) : (
	                      <span className="text-muted-foreground">
	                        Pick a date range
	                      </span>
	                    )}
	                  </Button>
	                </PopoverTrigger>
	                <PopoverContent className="w-auto p-0" align="start">
	                  <Calendar
	                    initialFocus
	                    mode="range"
	                    numberOfMonths={2}
	                    defaultMonth={
	                      deliveryWindow?.from
	                        ? new Date(deliveryWindow.from)
	                        : undefined
	                    }
	                    selected={{
	                      from: deliveryWindow?.from
	                        ? new Date(deliveryWindow.from)
	                        : undefined,
	                      to: deliveryWindow?.to
	                        ? new Date(deliveryWindow.to)
	                        : undefined,
	                    }}
	                    onSelect={(range) => {
	                      if (!range) return;
	                      const from = range.from ? formatDate(range.from) : null;
	                      const to = range.to ? formatDate(range.to) : from;
	                      if (!from) return;
	                      setDeliveryWindow({ from, to });
	                    }}
	                    disabled={(day) => {
	                      const today = new Date();
	                      today.setHours(0, 0, 0, 0);
	                      return day < today;
	                    }}
	                  />
	                </PopoverContent>
	              </Popover>
	            </div>
	          ) : (
	            <div />
	          )}

	          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
	            <Button
	              type="button"
	              variant="outline"
	              className="h-10"
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
	              className="h-10"
	              variant={
	                resolvedAction === "refunded" ? "destructive" : "default"
	              }
	              disabled={
	                !token ||
	                formSubmitted ||
              (resolvedAction === "redelivery" &&
                !(deliveryWindow?.from && deliveryWindow?.to))
            }
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
	          </div>
	        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ShortDeliveryActionModal);

