import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CartRemove,
  CartUpdate,
  SetReviewOpen,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { ClipboardList, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const measurementLabels = (measurement = "") => {
  const normalized = String(measurement || "").toLowerCase();
  if (normalized === "volume")
    return { unitCost: "Unit cost per Liter", qty: "Liters" };
  if (normalized === "weight")
    return { unitCost: "Unit cost per Kg", qty: "Kg" };
  return { unitCost: "Unit cost per Piece", qty: "Pieces" };
};

const CreateOrderCart = () => {
  const dispatch = useDispatch();
  const { cart } = useSelector(({ purchases }) => purchases);

  const totals = useMemo(() => {
    let totalItems = 0;
    const totalAmount = cart.reduce((sum, { quantity = 0, cost = 0 }) => {
      totalItems += Number(quantity || 0);
      return sum + Number(quantity || 0) * Number(cost || 0);
    }, 0);
    return { totalItems: cart.length, totalAmount };
  }, [cart]);

  const handleReview = () => {
    if (!cart.length) return;

    dispatch(SetReviewOpen());
  };

  return (
    <>
      <CardHeader className="space-y-1 ">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Order Details</CardTitle>
            <p className="text-xs text-muted-foreground">
              Assign supplier per item, then adjust quantities.
            </p>
          </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-xl"
            disabled={!cart.length}
            onClick={() => dispatch(CartClear())}
            title="Clear selected items"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-1 pt-0 ">
        <div
          className={
            cart.length
              ? "min-h-0 flex-1 space-y-3 overflow-auto pr-1"
              : "min-h-0 flex-1 overflow-auto pr-1"
          }
        >
          {cart.length ? (
            cart.map((item, index) => {
              const {
                inventory,
                quantity,
                supplier,
                cost: unitCost,
              } = item || {};
              const { suppliers } = inventory || {};
              const inventoryId = String(inventory?._id);
              const { unitCost: unitCostLabel, qty: qtyLabel } =
                measurementLabels(inventory?.measurement);

              const supplierOptions = suppliers
                .map((row) => ({
                  id: String(row?.supplier?._id || ""),
                  label: String(row?.supplier?.name || ""),
                  cost: row.cost,
                  isPrimary: Boolean(row?.isPrimary),
                }))
                .filter((opt) => opt.id);

              supplierOptions.sort(
                (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
              );

              return (
                <div
                  key={`${inventoryId}-${index}`}
                  className={`rounded-xl border bg-card/60 p-2.5 shadow-xs  border-border`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {inventory?.name || "Item"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-xl"
                      onClick={() => dispatch(CartRemove(inventory?._id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className=" grid gap-2">
                    <div className="grid grid-cols-[1fr_140px] items-end gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {unitCostLabel}
                        </Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          step="0.01"
                          value={unitCost}
                          onChange={(event) =>
                            dispatch(
                              CartUpdate({
                                inventory,
                                cost: Number(event.target.value || 0),
                              }),
                            )
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {qtyLabel}
                        </Label>
                        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background/40 px-1.5 py-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => {
                              const qty = Math.max(
                                0,
                                Number(item.quantity || 0) - 1,
                              );
                              dispatch(
                                CartUpdate({ inventory, quantity: qty }),
                              );
                            }}
                            title="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            value={quantity}
                            onChange={(event) => {
                              const nextValue = event.target.value.replace(
                                /[^\d]/g,
                                "",
                              );
                              console.log("nextValue", nextValue);

                              dispatch(
                                CartUpdate({
                                  inventory,
                                  quantity: Number(nextValue) || 1,
                                }),
                              );
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="h-7 w-14 rounded-lg bg-background text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => {
                              dispatch(
                                CartUpdate({
                                  inventory,
                                  quantity: Number(item.quantity || 0) + 1,
                                }),
                              );
                            }}
                            title="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Supplier
                      </Label>
                      <Select
                        value={supplier}
                        onValueChange={(value) => {
                          dispatch(
                            CartUpdate({
                              inventory,
                              cost: supplierOptions.find(
                                (option) => option.id === value,
                              )?.cost,
                              supplier: value || "all",
                            }),
                          );
                        }}
                      >
                        <SelectTrigger
                          className="h-9 w-full"
                          data-supplier-trigger
                        >
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Select supplier</SelectItem>
                          {supplierOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              <span
                                className={
                                  option.isPrimary
                                    ? "font-semibold text-primary"
                                    : "text-foreground"
                                }
                              >
                                {option.label || "Supplier"}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                ({Formatter.amount(option.cost)})
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  No selected items yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Click any row in the list to select items for ordering.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3 pt-3">
          <Separator />

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Items</span>
              <span className="font-semibold text-foreground">
                {totals.totalItems}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Est. total</span>
              <span className="font-semibold text-foreground">
                {Formatter.amount(totals.totalAmount)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!cart.length}
            onClick={handleReview}
          >
            <ClipboardList className="h-4 w-4" />
            Review Order
          </Button>
        </div>
      </CardContent>
    </>
  );
};

export default CreateOrderCart;
