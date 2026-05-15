import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { capitalize } from "lodash";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Stock } from "@/services/utilities";
import { TOGGLE_WASTE_MODAL } from "@/services/redux/slices/inventory/inventoryItems";

const WASTE_REASONS = [
  { value: "damaged", label: "Damaged" },
  { value: "spoiled", label: "Spoiled" },
  { value: "other", label: "Other" },
];

const sanitizeInteger = (value) => String(value ?? "").replace(/[^\d]/g, "");

const sanitizeDecimal = (value, maxDecimals = 2) => {
  const raw = String(value ?? "");
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const whole = cleaned.slice(0, firstDot);
  const decimals = cleaned
    .slice(firstDot + 1)
    .replace(/\./g, "")
    .slice(0, maxDecimals);
  return `${whole}.${decimals}`;
};

const getUnitOptions = (measurement) => {
  const key = String(measurement || "").toLowerCase();
  if (key === "weight") return ["kg", "g"];
  if (key === "volume") return ["l", "ml"];
  if (key === "pieces") return ["pcs"];
  return ["pcs"];
};

const getAvailableForUnit = (selected, unit) => {
  const measurement = String(selected?.measurement || "").toLowerCase();
  if (measurement === "weight") {
    if (unit === "g") return Number(selected?.stock?.current ?? 0);
    return Number(selected?.stockDisplay?.current ?? 0);
  }

  if (measurement === "volume") {
    if (unit === "ml") return Number(selected?.stock?.current ?? 0);
    return Number(selected?.stockDisplay?.current ?? 0);
  }

  return Number(selected?.stockDisplay?.current ?? selected?.stock?.current ?? 0);
};

const formatAvailableLabel = (selected, unit) => {
  const measurement = String(selected?.measurement || "").toLowerCase();
  const rawAvailable = getAvailableForUnit(selected, unit);
  if (measurement === "weight") {
    if (unit === "g") return `${rawAvailable} g`;
    return Stock.display(rawAvailable, selected?.measurement);
  }

  if (measurement === "volume") {
    if (unit === "ml") return `${rawAvailable} ml`;
    return `${rawAvailable} L`;
  }

  return `${rawAvailable} pc`;
};

const ReportWasteModal = ({ onSubmit }) => {
  const { showWasteModal, selected } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );

  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitOptions = useMemo(
    () => getUnitOptions(selected?.measurement),
    [selected?.measurement],
  );

  const [form, setForm] = useState({
    source: "damaged",
    qty: "",
    unit: unitOptions[0] || "kg",
    remarks: "",
  });

  const [errors, setErrors] = useState({});

  const toggle = () => dispatch(TOGGLE_WASTE_MODAL());

  useEffect(() => {
    if (showWasteModal) {
      const initialUnit = getUnitOptions(selected?.measurement)[0] || "kg";
      setForm({
        source: "damaged",
        qty: "",
        unit: initialUnit,
        remarks: "",
      });
      setErrors({});
    }
  }, [showWasteModal, selected?.measurement]);

  const availableMax = useMemo(
    () => getAvailableForUnit(selected, form.unit),
    [selected, form.unit],
  );

  const availableLabel = useMemo(
    () => formatAvailableLabel(selected, form.unit),
    [selected, form.unit],
  );

  const validate = () => {
    const nextErrors = {};
    const qtyNumber = Number(form.qty);

    if (!form.source) nextErrors.source = "Please select a waste reason.";

    if (!form.qty || Number.isNaN(qtyNumber) || qtyNumber <= 0) {
      nextErrors.qty = "Please enter a valid quantity.";
    } else if (qtyNumber > availableMax) {
      nextErrors.qty = `Quantity must not exceed available stock (${availableLabel}).`;
    }

    if (!form.unit) nextErrors.unit = "Please select a unit.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selected?._id) return;
    if (!validate()) return;

    const payload = {
      qty: Number(form.qty),
      unit: form.unit,
      inventory: selected._id,
      source: form.source,
      remarks: form.remarks || "",
      measurement: selected.measurement,
      trackExpiration: Boolean(selected?.trackExpiration),
    };

    if (typeof onSubmit !== "function") {
      // UI-only: user will wire actual submit.
      console.log("reportWaste payload:", payload);
      toast.info("Report Waste modal is ready (UI only).");
      return;
    }

    setIsSubmitting(true);
    Promise.resolve(onSubmit(payload))
      .then(() => {
        toast.success("Waste reported successfully.");
        toggle();
      })
      .catch((error) => {
        toast.error(error?.message || error || "Failed to report waste.");
      })
      .finally(() => setIsSubmitting(false));
  };

  const measurementKey = String(selected?.measurement || "").toLowerCase();
  const qtyIsInteger = measurementKey === "pieces" || form.unit === "g";

  return (
    <Dialog open={showWasteModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card p-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report Waste - {capitalize(selected?.name || "Inventory Item")}
          </DialogTitle>
          <DialogDescription>
            Choose a reason and enter how much stock you want to report as waste.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-[8px] border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium text-foreground">
              Available:{" "}
              <span className="font-semibold text-foreground">
                {availableLabel}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Validation uses the selected unit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Waste reason/source</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {WASTE_REASONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source ? (
                <p className="text-xs text-destructive">{errors.source}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(value) => {
                  setForm((prev) => ({
                    ...prev,
                    unit: value,
                    qty: "",
                  }));
                  setErrors((prev) => ({ ...prev, qty: "" }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit ? (
                <p className="text-xs text-destructive">{errors.unit}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="text"
                inputMode={qtyIsInteger ? "numeric" : "decimal"}
                pattern={qtyIsInteger ? "[0-9]*" : undefined}
                autoComplete="off"
                value={String(form.qty)}
                onBeforeInput={(event) => {
                  if (!qtyIsInteger) return;
                  const data = event.data ?? "";
                  if (data && /\D/.test(data)) event.preventDefault();
                }}
                onKeyDown={(event) => {
                  if (!qtyIsInteger) return;
                  if (
                    event.key === "." ||
                    event.key === "," ||
                    event.key === "e" ||
                    event.key === "E"
                  ) {
                    event.preventDefault();
                  }
                }}
                onPaste={(event) => {
                  const text = event.clipboardData?.getData("text") ?? "";
                  const next = qtyIsInteger
                    ? sanitizeInteger(text)
                    : sanitizeDecimal(text);
                  event.preventDefault();
                  setForm((prev) => ({ ...prev, qty: next }));
                }}
                onChange={(event) => {
                  const next = qtyIsInteger
                    ? sanitizeInteger(event.target.value)
                    : sanitizeDecimal(event.target.value);
                  setForm((prev) => ({ ...prev, qty: next }));
                }}
                placeholder={`Enter qty (max ${availableLabel})`}
                aria-invalid={Boolean(errors.qty)}
              />
              {errors.qty ? (
                <p className="text-xs text-destructive">{errors.qty}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Must be {"<="} {availableLabel}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Remarks (optional)</Label>
              <Textarea
                value={form.remarks}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, remarks: event.target.value }))
                }
                rows={3}
                placeholder="Add additional notes (optional)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Report Waste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportWasteModal;
