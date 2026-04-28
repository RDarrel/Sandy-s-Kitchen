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
  ReviewSetSameExpectedDelivery,
  ReviewSetSameSupplierId,
  ReviewSetSupplierExpectedDelivery,
  SAVE,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import ReviewOrderItemsList from "./items-list";

const ReviewOrderModal = ({ entries = [], supplierOptions = [] }) => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);
  const {
    reviewOpen,
    supplierMode,
    reviewSameSupplierId,
    reviewSameExpectedDelivery,
    reviewExpectedDeliveryBySupplier,
  } = useSelector(({ purchases }) => purchases);

  const supplierLabelById = useMemo(() => {
    const map = new Map();
    for (const option of Array.isArray(supplierOptions) ? supplierOptions : []) {
      if (option?.id) map.set(String(option.id), String(option.label || "Supplier"));
    }
    return map;
  }, [supplierOptions]);

  const totals = useMemo(() => {
    const totalItems = Array.isArray(entries) ? entries.length : 0;
    const totalAmount = (Array.isArray(entries) ? entries : []).reduce((sum, entry) => {
      const unitCost = Number(entry?.line?.cost ?? entry?.item?.cost) || 0;
      return sum + unitCost * (entry?.line?.quantity || 0);
    }, 0);
    return { totalItems, totalAmount };
  }, [entries]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const entry of Array.isArray(entries) ? entries : []) {
      const supplierId = String(entry?.line?.supplier || "all");
      if (!map.has(supplierId)) map.set(supplierId, []);
      map.get(supplierId).push(entry);
    }
    return Array.from(map.entries())
      .filter(([supplierId]) => supplierId && supplierId !== "all")
      .map(([supplierId, rows]) => {
        const totalAmount = rows.reduce((sum, row) => {
          const unitCost = Number(row?.line?.cost ?? row?.item?.cost) || 0;
          return sum + unitCost * (row?.line?.quantity || 0);
        }, 0);
        const totalItems = rows.length;
        return { supplierId, rows, totalAmount, totalItems };
      });
  }, [entries]);

  const close = (nextOpen) => dispatch(SetReviewOpen(Boolean(nextOpen)));

  const placeOrder = () => {
    if (!entries?.length) return close(false);

    if (supplierMode === "same") {
      if (!reviewSameSupplierId || reviewSameSupplierId === "all") {
        return toast.error("Select a supplier for this order.");
      }
      if (!reviewSameExpectedDelivery) {
        return toast.error("Select an expected delivery date.");
      }

      const lines = entries.map(({ item, line }) => {
        const inventory = String(line?.inventory || "");
        const quantity = Number(line?.quantity) || 0;
        const unitCost = Number(line?.cost ?? item?.cost) || 0;
        return {
          inventory,
          quantity,
          unitCost,
          // Backend expects supplierId; cart line key is `supplier`.
          supplierId: reviewSameSupplierId,
          supplierName: supplierLabelById.get(reviewSameSupplierId) || "Supplier",
          expectedDelivery: reviewSameExpectedDelivery,
        };
      });

      dispatch(
        SAVE({
          token,
          data: {
            role: "administrator",
            action: "createOrder",
            performBy: auth?._id,
            supplierMode: "same",
            supplierId: reviewSameSupplierId,
            supplierName: supplierLabelById.get(reviewSameSupplierId) || "Supplier",
            expectedDelivery: reviewSameExpectedDelivery,
            totals,
            lines,
          },
        }),
      )
        .unwrap()
        .then(() => {
          toast.success("Order created.");
          dispatch(CartClear());
          close(false);
        })
        .catch(() => {
          toast.error("Failed to create order.");
        });

      return;
    }

    for (const group of groups) {
      const expected = String(reviewExpectedDeliveryBySupplier?.[group.supplierId] || "");
      if (!expected) {
        toast.error(
          `Select an expected delivery date for "${supplierLabelById.get(group.supplierId) || "Supplier"}".`,
        );
        return;
      }
    }

    const lines = entries.map(({ item, line }) => {
      const inventory = String(line?.inventory || "");
      const quantity = Number(line?.quantity) || 0;
      const unitCost = Number(line?.cost ?? item?.cost) || 0;
      const supplierId = String(line?.supplier || "all");
      return {
        inventory,
        quantity,
        unitCost,
        supplierId,
        supplierName: supplierLabelById.get(supplierId) || "Supplier",
        expectedDelivery: String(reviewExpectedDeliveryBySupplier?.[supplierId] || ""),
      };
    });

    dispatch(
      SAVE({
        token,
        data: {
          role: "administrator",
          action: "createOrder",
          performBy: auth?._id,
          supplierMode: "different",
          expectedDeliveryBySupplier: reviewExpectedDeliveryBySupplier || {},
          totals,
          lines,
        },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Order created.");
        dispatch(CartClear());
        close(false);
      })
      .catch(() => {
        toast.error("Failed to create order.");
      });
  };

  return (
    <Dialog open={reviewOpen} onOpenChange={close}>
      <DialogContent className="max-w-3xl max-h-[95dvh] grid-rows-[auto_1fr_auto_auto_auto]">
        <DialogHeader>
          <DialogTitle>Review Order</DialogTitle>
          <DialogDescription>
            Double-check the items and quantities carefully. Once you place this
            order, it can’t be edited.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-auto pr-1">
          {supplierMode === "different" ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.supplierId}
                  className="rounded-xl border border-border bg-card/60 p-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-0.5">
                      <p className="text-base font-semibold text-foreground">
                        {supplierLabelById.get(group.supplierId) || "Supplier"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {group.totalItems} item(s) •{" "}
                        <span className="text-base font-semibold text-foreground">
                          {Formatter.amount(group.totalAmount)}
                        </span>
                      </p>
                    </div>

                    <div className="w-full space-y-1 sm:w-56">
                      <Label className="text-xs text-muted-foreground">
                        Expected delivery
                      </Label>
                      <Input
                        type="date"
                        value={String(reviewExpectedDeliveryBySupplier?.[group.supplierId] || "")}
                        onChange={(event) =>
                          dispatch(
                            ReviewSetSupplierExpectedDelivery({
                              supplierId: group.supplierId,
                              date: event.target.value,
                            }),
                          )
                        }
                      />
                    </div>
                  </div>

                  <Separator className="my-3" />
                  <ReviewOrderItemsList rows={group.rows} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card/60 p-3">
                <p className="text-sm font-semibold text-foreground">Items</p>
                <Separator className="my-3" />
                <ReviewOrderItemsList rows={entries} />
              </div>
            </div>
          )}
        </div>

        {supplierMode === "same" ? (
          <div className="rounded-xl border border-border bg-card/60 p-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-foreground">
                Supplier & delivery
              </p>
              <p className="text-xs text-muted-foreground">
                {totals.totalItems} item(s) •{" "}
                <span className="text-base font-semibold text-foreground">
                  {Formatter.amount(totals.totalAmount)}
                </span>
              </p>
            </div>
            <Separator className="my-3" />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Supplier</Label>
                <Select
                  value={String(reviewSameSupplierId || "all")}
                  onValueChange={(value) => dispatch(ReviewSetSameSupplierId(value))}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Select supplier</SelectItem>
                    {supplierOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Expected delivery
                </Label>
                <Input
                  type="date"
                  value={String(reviewSameExpectedDelivery || "")}
                  onChange={(event) =>
                    dispatch(ReviewSetSameExpectedDelivery(event.target.value))
                  }
                />
              </div>
            </div>
          </div>
        ) : null}

        {supplierMode !== "same" ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Items</span>
              <span className="font-semibold text-foreground">{totals.totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total</span>
              <span className="text-base font-semibold text-foreground">
                {Formatter.amount(totals.totalAmount)}
              </span>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={placeOrder}>
            Place order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewOrderModal;
