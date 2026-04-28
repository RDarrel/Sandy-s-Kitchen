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
  CartDecrement,
  CartIncrement,
  CartClear,
  CartRemove,
  SetReviewOpen,
  CartSetLineQuantity,
  CartSetLineUnitCost,
  CartSetLineSupplier,
} from "@/services/redux/slices/procurement/purchases";
import { Formatter } from "@/services/utilities";
import { ClipboardList, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const { collections: inventoryCollections = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const [quantityDraftById, setQuantityDraftById] = useState({});
  const [supplierErrorIds, setSupplierErrorIds] = useState([]);
  const entryRefById = useRef({});

  const inventoryById = useMemo(() => {
    const map = new Map();
    for (const item of Array.isArray(inventoryCollections)
      ? inventoryCollections
      : []) {
      if (item?._id) map.set(String(item._id), item);
    }
    return map;
  }, [inventoryCollections]);

  const cartLines = useMemo(() => {
    const lines = Array.isArray(cart?.lines) ? cart.lines : [];
    return lines
      .map((line) => ({
        inventory: String(line?.inventory || ""),
        supplier: String(line?.supplier || "all"),
        cost: Number.isFinite(Number(line?.cost))
          ? Number(line?.cost)
          : undefined,
        quantity: Math.max(0, Number(line?.quantity) || 0),
      }))
      .filter((line) => line.inventory && line.quantity > 0);
  }, [cart]);

  const entries = useMemo(() => {
    return cartLines
      .map((line) => {
        const item = inventoryById.get(line.inventory);
        if (!item) return null;
        return { line, item };
      })
      .filter(Boolean);
  }, [cartLines, inventoryById]);

  useEffect(() => {
    for (const entry of entries) {
      const inventory = String(entry?.line?.inventory || "");
      if (!inventory) continue;
      if (entry?.line?.cost !== undefined) continue;

      const fallback = Number(entry?.item?.cost);
      if (!Number.isFinite(fallback)) continue;
      dispatch(CartSetLineUnitCost({ inventory, cost: fallback }));
    }
  }, [dispatch, entries]);

  useEffect(() => {
    setQuantityDraftById((current) => {
      const next = { ...current };
      const activeIds = new Set();

      for (const entry of entries) {
        const inventory = String(entry?.line?.inventory || "");
        if (!inventory) continue;
        activeIds.add(inventory);

        if (next[inventory] === undefined) {
          next[inventory] = String(entry?.line?.quantity || 1);
        }
      }

      for (const key of Object.keys(next)) {
        if (!activeIds.has(key)) delete next[key];
      }

      return next;
    });
  }, [entries]);

  const totals = useMemo(() => {
    const totalItems = entries.length;
    const totalAmount = entries.reduce((sum, entry) => {
      const effectiveUnitCost =
        entry?.line?.cost !== undefined ? Number(entry?.line?.cost) || 0
          : Number(entry?.item?.cost) || 0;
      return sum + effectiveUnitCost * (entry?.line?.quantity || 0);
    }, 0);
    return { totalItems, totalAmount };
  }, [entries]);

  const handleReview = () => {
    if (!entries.length) return;

    const missing = entries.filter(({ line }) => {
      const supplier = String(line?.supplier || "all");
      return !supplier || supplier === "all";
    });

    if (!missing.length) {
      setSupplierErrorIds([]);
      dispatch(SetReviewOpen(true));
      return;
    }

    const missingIds = missing.map(({ line }) => String(line?.inventory || ""));
    setSupplierErrorIds(missingIds);

    const firstMissing = missing[0];
    const firstInventoryId = String(firstMissing?.line?.inventory || "");
    const firstItemName = String(firstMissing?.item?.name || "item");

    toast.error(`Select a supplier for "${firstItemName}".`);

    const node = entryRefById.current[firstInventoryId];
    if (node?.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const trigger = node?.querySelector?.("[data-supplier-trigger]");
    if (trigger?.focus) {
      setTimeout(() => trigger.focus(), 250);
    }
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
            disabled={!entries.length}
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
            entries.length
              ? "min-h-0 flex-1 space-y-3 overflow-auto pr-1"
              : "min-h-0 flex-1 overflow-auto pr-1"
          }
        >
          {entries.length ? (
            entries.map(({ item, line }) => {
              const inventoryId = String(line.inventory);
              const fallbackUnitCost = Number(item?.cost) || 0;
              const unitCost =
                line?.cost !== undefined ? Number(line.cost) || 0
                  : fallbackUnitCost;
              const { unitCost: unitCostLabel, qty: qtyLabel } =
                measurementLabels(item?.measurement);
              const lineSupplierId = String(line?.supplier);
              const quantityDraft =
                quantityDraftById[inventoryId] ?? String(line?.quantity || 1);
              const supplierHasError =
                supplierErrorIds.includes(inventoryId) &&
                (lineSupplierId === "all" || !lineSupplierId);

              const supplierOptions = (
                Array.isArray(item?.suppliers) ? item.suppliers : []
              )
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
                  key={inventoryId}
                  ref={(node) => {
                    if (!inventoryId) return;
                    if (node) entryRefById.current[inventoryId] = node;
                    else delete entryRefById.current[inventoryId];
                  }}
                  className={`rounded-xl border bg-card/60 p-2.5 shadow-xs ${supplierHasError ? "border-destructive/40 bg-destructive/5" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item?.name || "Item"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-xl"
                      onClick={() => dispatch(CartRemove(inventoryId))}
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
                          min={0}
                          step="0.01"
                          value={unitCost}
                          onChange={(event) =>
                            dispatch(
                              CartSetLineUnitCost({
                                inventory: inventoryId,
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
                              setQuantityDraftById((current) => ({
                                ...current,
                                [inventoryId]: String(
                                  Math.max(0, Number(line.quantity || 0) - 1),
                                ),
                              }));
                              dispatch(CartDecrement(inventoryId));
                            }}
                            title="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>

                          <Input
                            value={quantityDraft}
                            onChange={(event) => {
                              const nextValue = event.target.value.replace(
                                /[^\d]/g,
                                "",
                              );
                              setQuantityDraftById((current) => ({
                                ...current,
                                [inventoryId]: nextValue,
                              }));
                            }}
                            onBlur={() => {
                              const nextQty = Number(
                                quantityDraftById[inventoryId],
                              );
                              if (!Number.isFinite(nextQty) || nextQty <= 0) {
                                setQuantityDraftById((current) => ({
                                  ...current,
                                  [inventoryId]: String(line.quantity || 1),
                                }));
                                return;
                              }

                              dispatch(
                                CartSetLineQuantity({
                                  inventory: inventoryId,
                                  quantity: nextQty,
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
                              setQuantityDraftById((current) => ({
                                ...current,
                                [inventoryId]: String(
                                  (Number(line.quantity) || 0) + 1,
                                ),
                              }));
                              dispatch(CartIncrement(inventoryId));
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
                        value={lineSupplierId}
                        onValueChange={(value) => {
                          setSupplierErrorIds((current) =>
                            current.filter((id) => id !== inventoryId),
                          );
                          dispatch(
                            CartSetLineSupplier({
                              inventory: inventoryId,
                              supplier: value || "all",
                              cost: supplierOptions.find(
                                (option) => option.id === value,
                              )?.cost,
                            }),
                          );
                        }}
                      >
                        <SelectTrigger
                          className="h-9 w-full"
                          data-supplier-trigger
                          aria-invalid={supplierHasError ? "true" : "false"}
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
                      {supplierHasError ? (
                        <p className="text-xs text-destructive">
                          Supplier is required for this item.
                        </p>
                      ) : null}
                      {!supplierOptions.length ? (
                        <p className="text-xs text-muted-foreground">
                          No suppliers tagged for this item.
                        </p>
                      ) : null}
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
            disabled={!entries.length}
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
