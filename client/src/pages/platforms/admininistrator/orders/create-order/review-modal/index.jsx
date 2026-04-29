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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CartClear,
  SAVE,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReviewOrderItemsList from "./items-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search } from "lucide-react";
const ReviewOrderModal = ({ entries = [] }) => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  const { cart } = useSelector(({ purchases }) => purchases);
  const [formattedCart, setFormattedCart] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");

  const [draftQtyById, setDraftQtyById] = useState({});

  const { reviewOpen } = useSelector(({ purchases }) => purchases);

  const supplierLabelById = useMemo(() => {
    const map = new Map();
    for (const option of Array.isArray(suppliers) ? suppliers : []) {
      if (option?._id)
        map.set(String(option._id), String(option.name || "Supplier"));
    }
    return map;
  }, [suppliers]);

  const totalAmount = (Array.isArray(cart) ? cart : []).reduce((sum, entry) => {
    const id = String(entry?.inventory?._id || "");

    const displayQty = Number(draftQtyById[id] ?? entry.quantity) || 0;
    const unitCost = Number(entry?.cost) || 0;

    return sum + displayQty * unitCost;
  }, 0);

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

  useEffect(() => {
    if (!reviewOpen) return;

    const groupsMap = new Map();

    cart.forEach((item) => {
      const key = item?.supplier;

      if (!groupsMap.has(key)) {
        const defaultWindow = getDefaultDeliveryWindow();

        groupsMap.set(key, {
          supplier: key,
          items: [],
          ...(!Object.values(item?.deliveryWindow || {})?.length && {
            deliveryWindow: {
              from:
                formatDate(item?.deliveryWindow?.from) || defaultWindow.from,
              to: formatDate(item?.deliveryWindow?.to) || defaultWindow.to,
            },
          }),
        });
      }

      groupsMap.get(key).items.push(item);
    });

    const result = Array.from(groupsMap.values()).map((group) => {
      const totalAmount = group.items.reduce((sum, item) => {
        const unitCost = Number(item?.cost) || 0;
        const qty = Number(item?.quantity) || 0;
        return sum + unitCost * qty;
      }, 0);

      return {
        ...group,
        totalAmount,
      };
    });

    setFormattedCart(result);
  }, [cart, reviewOpen]);

  useEffect(() => {
    if (!reviewOpen) return;
    setSupplierFilter("all");
    setItemSearch("");
  }, [reviewOpen]);

  const supplierFilterOptions = useMemo(() => {
    return (Array.isArray(formattedCart) ? formattedCart : [])
      .map((group) => String(group?.supplier || ""))
      .filter(Boolean);
  }, [formattedCart]);

  useEffect(() => {
    if (supplierFilter === "all") return;
    if (!supplierFilterOptions.includes(supplierFilter)) {
      setSupplierFilter("all");
    }
  }, [supplierFilter, supplierFilterOptions]);

  const visibleGroups = useMemo(() => {
    const query = String(itemSearch || "")
      .trim()
      .toLowerCase();
    const baseGroups =
      supplierFilter !== "all"
        ? (Array.isArray(formattedCart) ? formattedCart : []).filter(
            (group) => String(group?.supplier || "") === supplierFilter,
          )
        : Array.isArray(formattedCart)
          ? formattedCart
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

        const totalAmount = items.reduce((sum, item) => {
          const unitCost = Number(item?.cost) || 0;
          const qty = Number(item?.quantity) || 0;
          return sum + unitCost * qty;
        }, 0);

        return { ...group, items, totalAmount };
      })
      .filter((group) => (group?.items || []).length);
  }, [formattedCart, itemSearch, supplierFilter]);

  const handleDateChange = (newDate, supplier) => {
    const _formattedCart = [...formattedCart];
    const groupIndex = _formattedCart.findIndex(
      (group) => group.supplier === supplier,
    );
    if (groupIndex !== -1) {
      _formattedCart[groupIndex] = {
        ..._formattedCart[groupIndex],
        deliveryWindow: newDate,
      };
    }
    setFormattedCart(_formattedCart);
  };

  const close = (nextOpen) => dispatch(SetReviewOpen(Boolean(nextOpen)));
  const placeOrder = () => {};

  return (
    <Dialog open={reviewOpen} onOpenChange={close}>
      <DialogContent
        className="max-w-3xl  grid-rows-[auto_1fr_auto_auto_auto]"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Review Order</DialogTitle>
          <DialogDescription>
            Double-check the items and quantities carefully. Once you place this
            order, it can’t be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-auto pr-1 ">
          <div className="space-y-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:flex-1">
                <Label className="text-xs text-muted-foreground">
                  Search item
                </Label>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={itemSearch}
                    type="search"
                    onChange={(event) => setItemSearch(event.target.value)}
                    placeholder="Search items..."
                    className="h-9 w-full pl-9"
                  />
                </div>
              </div>
              <div className="w-full sm:w-64">
                <Label className="text-xs text-muted-foreground">
                  Supplier
                </Label>
                <Select
                  value={supplierFilter}
                  onValueChange={setSupplierFilter}
                >
                  <SelectTrigger className="mt-1 h-9 w-full">
                    <SelectValue placeholder="All suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All suppliers</SelectItem>
                    {supplierFilterOptions.map((supplierId) => (
                      <SelectItem key={supplierId} value={supplierId}>
                        {supplierLabelById.get(supplierId) || "Supplier"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {visibleGroups.length ? (
              visibleGroups.map((group) => (
                <SupplierRaw
                  key={group.supplier}
                  group={group}
                  supplierLabelById={supplierLabelById}
                  handleDateChange={handleDateChange}
                  setDraftQtyById={setDraftQtyById}
                  draftQtyById={draftQtyById}
                />
              ))
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    No matching items
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try a different supplier or search term.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/70 px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground">Items</span>
                <span className="text-sm font-semibold text-foreground">
                  {cart.length}
                </span>
              </div>
              <span className="h-4 w-px bg-border/70" aria-hidden="true" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground">Suppliers</span>
                <span className="text-sm font-semibold text-foreground">
                  {formattedCart.length}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-3 rounded-lg bg-background/40 px-3 py-2 sm:justify-end sm:text-right">
              <span className="text-xs text-muted-foreground">
                Total amount
              </span>
              <span className="text-base font-semibold leading-none text-foreground">
                {Formatter.amount(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={placeOrder}>
            Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewOrderModal;

const SupplierRaw = memo(
  ({
    group,
    supplierLabelById,
    handleDateChange,
    draftQtyById,
    setDraftQtyById,
  }) => {
    const { deliveryWindow } = group;
    return (
      <div
        key={group.supplier}
        className="rounded-xl border border-border bg-card/60 p-3 "
      >
        <div className=" flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-base font-semibold text-foreground">
              {supplierLabelById.get(group.supplier) || "Supplier"}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {group.items?.length} item(s)
              </span>{" "}
              <span className="mx-1 text-muted-foreground">•</span>
              <span className="text-base font-semibold text-foreground">
                {Formatter.amount(group.totalAmount)}
              </span>{" "}
            </p>
          </div>

          <div className="w-full space-y-1 sm:w-80">
            <Label className="text-xs text-muted-foreground">
              Expected delivery date
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[300px]",
                  )}
                >
                  <CalendarIcon />
                  {deliveryWindow?.from ? (
                    deliveryWindow?.to ? (
                      <>
                        {Formatter.date(deliveryWindow.from)} -{" "}
                        {Formatter.date(deliveryWindow.to)}
                      </>
                    ) : (
                      <>{Formatter.date(deliveryWindow.from)}</>
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={deliveryWindow?.from}
                  selected={deliveryWindow}
                  onSelect={(range) => {
                    if (!range) return;

                    // Case: pinili ulit yung parehong date (gawin from=to)
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

        <Separator className="my-3" />
        <ReviewOrderItemsList
          rows={group.items}
          setDraftQtyById={setDraftQtyById}
          draftQtyById={draftQtyById}
        />
      </div>
    );
  },
);
