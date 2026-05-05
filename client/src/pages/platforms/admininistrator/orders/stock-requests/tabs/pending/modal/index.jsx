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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Spinner from "@/components/shared/spinner";
import { SAVE as SAVE_PURCHASES } from "@/services/redux/slices/procurement/purchases";
import { UPDATE as UPDATE_STOCK_REQUEST } from "@/services/redux/slices/procurement/stock-requests";
import { Formatter, fullName, Inventory } from "@/services/utilities";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConvertToOrderItemsList from "./items-list";
import { CalendarIcon, Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const toDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const maybeDate = new Date(value);
  return Number.isNaN(maybeDate.getTime()) ? undefined : maybeDate;
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

const getPrimarySupplierRow = (inventory) => {
  const suppliers = Array.isArray(inventory?.suppliers) ? inventory.suppliers : [];
  return (
    suppliers
      .slice()
      .sort(
        (a, b) => Number(Boolean(b?.isPrimary)) - Number(Boolean(a?.isPrimary)),
      )[0] || null
  );
};

const buildGroupsFromRequest = (request, inventoryById) => {
  const items = Array.isArray(request?.items) ? request.items : [];
  const groupsMap = new Map();
  const defaultWindow = getDefaultDeliveryWindow();

  for (const item of items) {
    const inventoryId = String(item?.inventory?._id || item?.inventory || "");
    const inventory = inventoryId ? inventoryById.get(inventoryId) : null;

    const supplierRow = inventory ? getPrimarySupplierRow(inventory) : null;
    const supplierId = String(supplierRow?.supplier?._id || "unknown");
    const supplierLabel = String(supplierRow?.supplier?.name || "Supplier");
    const unitCost = Number(supplierRow?.cost ?? inventory?.cost ?? 0) || 0;

    if (!groupsMap.has(supplierId)) {
      groupsMap.set(supplierId, {
        supplier: supplierId,
        supplierLabel,
        items: [],
        deliveryWindow: {
          from: defaultWindow.from,
          to: defaultWindow.to,
        },
        totalAmount: 0,
      });
    }

    const group = groupsMap.get(supplierId);
    group.items.push({
      ...item,
      inventory: inventory || item?.inventory,
      __inventoryId: inventoryId,
      __unitCost: unitCost,
      __supplierId: supplierId,
      __supplierLabel: supplierLabel,
    });
  }

  return Array.from(groupsMap.values());
};

const ConvertToOrderModal = ({ open, onOpenChange, request }) => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  const { collections: inventories } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { formSubmitted } = useSelector(({ stockRequests }) => stockRequests);

  const [formattedGroups, setFormattedGroups] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");
  const [draftApprovedByInvId, setDraftApprovedByInvId] = useState({});
  const [draftUnitCostByInvId, setDraftUnitCostByInvId] = useState({});

  const supplierLabelById = useMemo(() => {
    const map = new Map();
    for (const option of Array.isArray(suppliers) ? suppliers : []) {
      if (option?._id) map.set(String(option._id), String(option.name || ""));
    }
    return map;
  }, [suppliers]);

  const inventoryById = useMemo(() => {
    const map = new Map();
    for (const row of Array.isArray(inventories) ? inventories : []) {
      if (row?._id) map.set(String(row._id), row);
    }
    return map;
  }, [inventories]);

  const requestedByLabel = useMemo(() => {
    const requestedBy = request?.requestedBy;
    if (requestedBy && typeof requestedBy === "object") {
      return fullName(requestedBy?.fullName || requestedBy);
    }
    return String(requestedBy || "Requester");
  }, [request]);

  useEffect(() => {
    if (!open) return;

    const groups = buildGroupsFromRequest(request, inventoryById);
    setFormattedGroups(groups);

    const initialDraft = {};
    const initialUnitCostDraft = {};
    for (const group of groups) {
      for (const item of Array.isArray(group?.items) ? group.items : []) {
        const inventoryId = String(item?.__inventoryId || "");
        if (!inventoryId) continue;
        initialDraft[inventoryId] = Number(item?.quantity?.approved ?? 0) || 0;
        initialUnitCostDraft[inventoryId] = Number(item?.__unitCost ?? 0) || 0;
      }
    }
    setDraftApprovedByInvId(initialDraft);
    setDraftUnitCostByInvId(initialUnitCostDraft);
    setSupplierFilter("all");
    setItemSearch("");
  }, [open, request, inventoryById]);

  const supplierFilterOptions = useMemo(() => {
    return (Array.isArray(formattedGroups) ? formattedGroups : [])
      .map((group) => String(group?.supplier || ""))
      .filter(Boolean);
  }, [formattedGroups]);

  useEffect(() => {
    if (supplierFilter === "all") return;
    if (!supplierFilterOptions.includes(supplierFilter)) {
      setSupplierFilter("all");
    }
  }, [supplierFilter, supplierFilterOptions]);

  const totals = useMemo(() => {
    const groups = Array.isArray(formattedGroups) ? formattedGroups : [];

    const suppliersCount = groups.length;
    const totalAmount = groups.reduce((sum, group) => {
      const groupAmount = (Array.isArray(group?.items) ? group.items : []).reduce(
        (sub, item) => {
          const inventoryId = String(item?.__inventoryId || "");
          const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;
          const unitCost = Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) || 0;
          return sub + approvedQty * unitCost;
        },
        0,
      );

      return sum + groupAmount;
    }, 0);

    return { suppliersCount, totalAmount };
  }, [formattedGroups, draftApprovedByInvId, draftUnitCostByInvId]);

  const handleDateChange = (newDate, supplierId) => {
    setFormattedGroups((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const idx = next.findIndex((g) => String(g?.supplier || "") === supplierId);
      if (idx < 0) return prev;
      next[idx] = { ...next[idx], deliveryWindow: newDate };
      return next;
    });
  };

  const removeItem = (supplierId, inventoryId) => {
    setFormattedGroups((prev) => {
      const next = (Array.isArray(prev) ? prev : []).map((group) => {
        if (String(group?.supplier || "") !== String(supplierId || "")) return group;
        const items = (Array.isArray(group?.items) ? group.items : []).filter(
          (item) => String(item?.__inventoryId || "") !== String(inventoryId || ""),
        );
        return { ...group, items };
      });

      return next.filter((group) => (group?.items || []).length);
    });

    setDraftApprovedByInvId((prev) => {
      const next = { ...(prev || {}) };
      delete next[String(inventoryId || "")];
      return next;
    });
  };

  const visibleGroups = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();

    const baseGroups =
      supplierFilter !== "all"
        ? (Array.isArray(formattedGroups) ? formattedGroups : []).filter(
            (group) => String(group?.supplier || "") === supplierFilter,
          )
        : Array.isArray(formattedGroups)
          ? formattedGroups
          : [];

    if (!query) return baseGroups;

    return baseGroups
      .map((group) => {
        const items = (Array.isArray(group?.items) ? group.items : []).filter(
          (item) => {
            const name = String(item?.inventory?.name || "").toLowerCase();
            return name.includes(query);
          },
        );

        return { ...group, items };
      })
      .filter((group) => (group?.items || []).length);
  }, [formattedGroups, itemSearch, supplierFilter]);

  const close = (nextOpen) => onOpenChange?.(Boolean(nextOpen));

  const placeOrder = (event) => {
    event.preventDefault();
    const requestId = String(request?._id || "");
    if (!requestId) return;

    const groups = Array.isArray(formattedGroups) ? formattedGroups : [];
    if (!groups.length) return;

    const cart = [];
    const purchases = [];

    for (const group of groups) {
      const supplierId = String(group?.supplier || "");
      const deliveryWindow = group?.deliveryWindow || getDefaultDeliveryWindow();

      let groupAmount = 0;
      const groupItems = Array.isArray(group?.items) ? group.items : [];

      for (const item of groupItems) {
        const inventoryId = String(item?.__inventoryId || "");
        if (!inventoryId) continue;

        const inventory = inventoryById.get(inventoryId) || item?.inventory;
        const unitCost =
          Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) || 0;
        const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;

        groupAmount += approvedQty * unitCost;

        cart.push({
          supplier: supplierId,
          cost: unitCost,
          inventory: inventoryId,
          unit: Inventory.getUnitByMeasurement(inventory?.measurement)?.toLowerCase(),
          quantity: { incoming: approvedQty },
        });
      }

      purchases.push({
        supplier: supplierId,
        deliveryWindow,
        totalAmount: groupAmount,
        status: "incoming",
      });
    }

    dispatch(SAVE_PURCHASES({ data: { cart, purchases }, token }))
      .unwrap()
      .then(() => {
        return dispatch(
          UPDATE_STOCK_REQUEST({
            data: {
              _id: requestId,
              status: "approved",
              admin: {
                reviewedBy: auth?._id,
                reviewedAt: new Date(),
              },
              conversion: {
                isConvertedToOrder: true,
                convertedBy: auth?._id,
                convertedAt: new Date(),
              },
              updatingRequest: true,
            },
            token,
          }),
        ).unwrap();
      })
      .then(() => {
        toast.success("Order placed successfully.");
        close(false);
      })
      .catch(() => toast.error("Failed to place order. Please try again."));
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        className="max-w-6xl p-1"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <form
          onSubmit={placeOrder}
          className="grid min-h-0 flex-1 grid-rows-[auto_1fr_auto]"
        >
          <div className="rounded-t-xl border-b border-border bg-card/70 px-5 py-4 pr-16">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/70 shadow-sm">
                      <ShoppingBag className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0">
                      <DialogTitle className="truncate text-lg">
                        Convert to order
                      </DialogTitle>
                      <DialogDescription className="hidden text-sm leading-snug sm:block">
                        Review items grouped by supplier before placing orders.
                      </DialogDescription>
                    </div>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Requested by:{" "}
                    <span className="font-medium text-foreground/90">
                      {requestedByLabel}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                  <Badge variant="secondary" className="rounded-full">
                    {totals.suppliersCount} supplier(s)
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    Total{" "}
                    <span className="ml-1 font-semibold tabular-nums text-foreground">
                      {Formatter.amount(totals.totalAmount)}
                    </span>
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 overflow-auto px-5 py-4">
            <div className="space-y-4">
              <div className="grid gap-4 rounded-xl border border-border bg-card/60 p-4 shadow-sm sm:grid-cols-2">
                <div className="w-full">
                  <Label className="text-xs text-muted-foreground">
                    Search item
                  </Label>
                  <div className="relative mt-1">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={itemSearch}
                      type="search"
                      onChange={(event) => setItemSearch(event.target.value)}
                      placeholder="Search items..."
                      className="h-10 w-full pl-9"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <Label className="text-xs text-muted-foreground">
                    Supplier
                  </Label>
                  <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                    <SelectTrigger className="mt-1 h-10 bg-background/60">
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All suppliers</SelectItem>
                      {supplierFilterOptions.map((supplierId) => (
                        <SelectItem key={supplierId} value={supplierId}>
                          {supplierLabelById.get(supplierId) || supplierId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {visibleGroups.length ? (
                visibleGroups.map((group) => (
                  <SupplierGroupCard
                    key={String(group?.supplier || "")}
                    group={group}
                    supplierLabelById={supplierLabelById}
                    handleDateChange={handleDateChange}
                    draftApprovedByInvId={draftApprovedByInvId}
                    setDraftApprovedByInvId={setDraftApprovedByInvId}
                    draftUnitCostByInvId={draftUnitCostByInvId}
                    setDraftUnitCostByInvId={setDraftUnitCostByInvId}
                    onRemoveItem={removeItem}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      No items found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try a different supplier or keyword.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-b-xl border-t border-border bg-card/70 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Suppliers:{" "}
                <span className="font-semibold text-foreground">
                  {totals.suppliersCount}
                </span>
                <span className="mx-2 text-muted-foreground/60">•</span>
                Total:{" "}
                <span className="font-semibold text-foreground">
                  {Formatter.amount(totals.totalAmount)}
                </span>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => close(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formSubmitted || !formattedGroups.length}>
                  Place order <Spinner formSubmitted={formSubmitted} />
                </Button>
              </DialogFooter>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(ConvertToOrderModal);

const SupplierGroupCard = memo(
  ({
    group,
    supplierLabelById,
    handleDateChange,
    draftApprovedByInvId,
    setDraftApprovedByInvId,
    draftUnitCostByInvId,
    setDraftUnitCostByInvId,
    onRemoveItem,
  }) => {
    const items = Array.isArray(group?.items) ? group.items : [];
    const itemsCount = items.length;
    const deliveryWindow = group?.deliveryWindow || {};

    const safeDeliveryWindow = {
      from: toDate(deliveryWindow?.from),
      to: toDate(deliveryWindow?.to),
    };

    const groupTotal = useMemo(() => {
      return items.reduce((sum, item) => {
        const inventoryId = String(item?.__inventoryId || "");
        const approvedQty = Number(draftApprovedByInvId[inventoryId] ?? 0) || 0;
        const unitCost =
          Number(draftUnitCostByInvId[inventoryId] ?? item?.__unitCost ?? 0) || 0;
        return sum + approvedQty * unitCost;
      }, 0);
    }, [items, draftApprovedByInvId, draftUnitCostByInvId]);

    return (
      <div className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">
                {supplierLabelById.get(group.supplier) ||
                  group?.supplierLabel ||
                  "Supplier"}
              </p>
              <Badge variant="secondary" className="rounded-full">
                {itemsCount} item(s)
              </Badge>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {Formatter.amount(groupTotal)}
            </p>
            <p className="text-xs text-muted-foreground">
              Set expected delivery range for this supplier.
            </p>
          </div>

          <div className="w-full space-y-1 sm:w-80">
            <Label className="text-xs text-muted-foreground">
              Expected delivery range
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start gap-2 text-left font-normal sm:w-[300px]",
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
                  defaultMonth={safeDeliveryWindow?.from}
                  selected={safeDeliveryWindow}
                  onSelect={(range) => {
                    if (!range) return;

                    if (range.from && !range.to) {
                      handleDateChange(
                        { from: range.from, to: range.from },
                        group.supplier,
                      );
                    } else {
                      handleDateChange(range, group.supplier);
                    }
                  }}
                  numberOfMonths={2}
                  disabled={(day) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return day < today;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator className="my-4" />
        <ConvertToOrderItemsList
          supplierId={group.supplier}
          rows={items}
          draftApprovedByInvId={draftApprovedByInvId}
          setDraftApprovedByInvId={setDraftApprovedByInvId}
          draftUnitCostByInvId={draftUnitCostByInvId}
          setDraftUnitCostByInvId={setDraftUnitCostByInvId}
          onRemoveItem={onRemoveItem}
        />
      </div>
    );
  },
);
