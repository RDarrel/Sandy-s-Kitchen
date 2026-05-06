import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Formatter, Inventory } from "@/services/utilities";
import { Trash2 } from "lucide-react";
import { memo, useMemo } from "react";

const measurementLabels = (measurement = "") => {
  const normalized = String(measurement || "").toLowerCase();

  if (normalized === "volume") {
    return { unitCost: "Unit cost per Liter" };
  }

  if (normalized === "weight") {
    return { unitCost: "Unit cost per Kg" };
  }

  return { unitCost: "Unit cost per Piece" };
};

const ConvertToOrderItemsList = ({
  supplierId,
  rows = [],
  draftApprovedByInvId,
  setDraftApprovedByInvId,
  draftUnitCostByInvId,
  setDraftUnitCostByInvId,
  onRemoveItem,
}) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-2">
      {safeRows.length ? (
        <div className="hidden grid-cols-[1fr_150px_120px_170px_150px_120px_56px] gap-3 px-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80 sm:grid">
          <span>Item</span>
          <span>Available stock</span>
          <span>Request qty</span>
          <span>Unit cost</span>
          <span className="text-center">Approved qty</span>
          <span className="text-right">Subtotal</span>
          <span className="text-right"> </span>
        </div>
      ) : null}

      {safeRows.map((item, idx) => (
        <ItemRow
          key={item?.__inventoryId || item?._id || idx}
          supplierId={supplierId}
          item={item}
          draftApprovedByInvId={draftApprovedByInvId}
          setDraftApprovedByInvId={setDraftApprovedByInvId}
          draftUnitCostByInvId={draftUnitCostByInvId}
          setDraftUnitCostByInvId={setDraftUnitCostByInvId}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
};

export default memo(ConvertToOrderItemsList);

const ItemRow = memo(
  ({
    supplierId,
    item,
    draftApprovedByInvId,
    setDraftApprovedByInvId,
    draftUnitCostByInvId,
    setDraftUnitCostByInvId,
    onRemoveItem,
  }) => {
    const inventory = item?.inventory;
    const inventoryId = String(item?.__inventoryId || inventory?._id || "");
    const unitCost = Number(draftUnitCostByInvId?.[inventoryId] ?? item?.__unitCost ?? 0) || 0;
    const availableStock = Number(item?.snapshot?.currentStock ?? 0) || 0;
    const requestQty = Number(item?.quantity?.request ?? 0) || 0;

    const { unitLabel, unitCostLabel } = useMemo(() => {
      const unitLabel = Inventory.getUnitByMeasurement(inventory?.measurement) || "";
      const unitCostLabel = measurementLabels(inventory?.measurement).unitCost;
      return { unitCostLabel, unitLabel };
    }, [inventory?.measurement]);

    const approvedValue = draftApprovedByInvId?.[inventoryId] ?? 0;

    const subtotal = useMemo(() => {
      const qty = Number(approvedValue) || 0;
      return (Number(unitCost) || 0) * qty;
    }, [approvedValue, unitCost]);

    const handleUnitCostChange = (event) => {
      const raw = String(event.target.value || 0);
      setDraftUnitCostByInvId((prev) => ({
        ...(prev || {}),
        [inventoryId]: Number(raw || 0),
      }));
    };

    const handleApprovedChange = (event) => {
      const raw = String(event.target.value || 0);
      setDraftApprovedByInvId((prev) => ({
        ...(prev || {}),
        [inventoryId]: Inventory.sanitizeQtyInp(inventory?.measurement, raw),
      }));
    };

    const handleRemove = () => onRemoveItem?.(supplierId, inventoryId);

    return (
      <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/30 px-3 py-3 text-sm shadow-sm transition-colors hover:bg-background/40 sm:grid-cols-[1fr_150px_120px_170px_150px_120px_56px] sm:items-center sm:gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {inventory?.name || "Item"}
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            Available stock
          </span>
          <p className="font-semibold tabular-nums text-foreground">
            {availableStock}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {unitLabel || ""}
            </span>
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">Request qty</span>
          <p className="font-semibold tabular-nums text-foreground">
            {requestQty}
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              {unitLabel || ""}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:block">
          <span className="text-xs text-muted-foreground sm:hidden">
            {unitCostLabel}
          </span>
          <div className="flex w-full items-center justify-between gap-2 sm:justify-start">
            <Input
              value={unitCost}
              required
              onChange={handleUnitCostChange}
              inputMode="decimal"
              className="h-9 w-32 rounded-md bg-background text-right text-sm tabular-nums shadow-sm"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              / {unitLabel || "unit"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-start sm:pl-2">
          <span className="text-xs text-muted-foreground sm:hidden">
            Approved qty
          </span>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Input
              value={approvedValue}
              required
              onChange={handleApprovedChange}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-9 w-28 rounded-md bg-background text-center text-sm tabular-nums shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none sm:w-24"
            />
            <span className="text-xs text-muted-foreground">{unitLabel}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end sm:text-right">
          <span className="text-xs text-muted-foreground sm:hidden">Subtotal</span>
          <p className="font-semibold tabular-nums text-foreground">
            {Formatter.amount(subtotal)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 sm:text-right">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-md text-destructive hover:text-destructive"
            onClick={handleRemove}
            aria-label={`Remove ${inventory?.name || "item"}`}
            title="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
);
