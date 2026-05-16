import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";

const getLineTotal = (entry) => {
  const qty = Number(entry?.line?.quantity) || 0;
  const base = Number(entry?.menu?.price) || 0;
  const addOnsTotal = (entry?.line?.addOns || []).reduce(
    (sum, addOn) => sum + (Number(addOn?.price) || 0),
    0,
  );
  return (base + addOnsTotal) * qty;
};

const formatDateTime = (value) => {
  try {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const CashierPaymentModal = ({ open, onOpenChange, totals, entries = [] }) => {
  const nowLabel = formatDateTime(Date.now());
  const safeEntries = Array.isArray(entries) ? entries : [];
  const [tenderedRaw, setTenderedRaw] = useState("");

  useEffect(() => {
    if (open) setTenderedRaw("");
  }, [open]);

  const tendered = useMemo(() => {
    const normalized = String(tenderedRaw || "")
      .replaceAll(",", "")
      .trim();
    if (!normalized) return null;
    const value = Number(normalized);
    if (!Number.isFinite(value)) return null;
    return value;
  }, [tenderedRaw]);

  const totalAmount = Number(totals?.totalAmount) || 0;
  const change = tendered == null ? null : tendered - totalAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg  p-1">
        <div className=" rounded-1xl  ">
          <div className="w-full bg-[color:color-mix(in_srgb,var(--card)_65%,white)] px-5 py-4 font-mono shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--border)_70%,transparent)]">
            <div className="text-center">
              <p className="text-sm font-bold tracking-wide">
                Sandy&apos;s Kitchenette
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {nowLabel}
              </p>
            </div>

            <div className="my-3 border-t border-dashed border-muted-foreground/40" />

            <div className="space-y-2 text-[12px] leading-5">
              {safeEntries.length ? (
                safeEntries.map((entry) => {
                  const lineId = String(entry?.line?.id || "");
                  const qty = Number(entry?.line?.quantity) || 0;
                  const name = String(entry?.menu?.name || "—");
                  const addOns = Array.isArray(entry?.line?.addOns)
                    ? entry.line.addOns
                    : [];
                  const lineTotal = getLineTotal(entry);

                  return (
                    <div key={lineId} className="space-y-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 break-words">
                          <span className="font-bold">{qty}x</span> {name}
                        </p>
                        <p className="shrink-0 font-bold">
                          {Formatter.amount(lineTotal)}
                        </p>
                      </div>

                      {addOns.length ? (
                        <div className="pl-5">
                          <div className="border-t border-dashed border-muted-foreground/35 pt-1" />
                          <div className="space-y-0.5 text-[11px] text-muted-foreground">
                            {addOns.map((addOn) => (
                              <div
                                key={String(addOn?._id || addOn?.name || "")}
                                className="flex items-start justify-between gap-3"
                              >
                                <p className="min-w-0 break-words">
                                  {String(addOn?.name || "Add-on")}
                                </p>
                                <p className="shrink-0">
                                  +{Formatter.amount(Number(addOn?.price) || 0)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground">
                  No items selected
                </p>
              )}
            </div>

            <div className="my-3 border-t border-dashed border-muted-foreground/40" />

            <div className="text-[12px]">
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span>{Formatter.amount(totalAmount)}</span>
              </div>

              <div className="mt-3 border-t border-dashed border-muted-foreground/40 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold">Tendered</span>
                  <div className="w-[160px]">
                    <Input
                      inputMode="decimal"
                      value={tenderedRaw}
                      onChange={(e) => setTenderedRaw(e.target.value)}
                      placeholder="0.00"
                      className="h-9 rounded-lg bg-background/60 text-right font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span className="font-bold">Change</span>
                  <span
                    className={
                      change != null && change < 0 ? "text-destructive" : ""
                    }
                  >
                    {change == null
                      ? "—"
                      : Formatter.amount(Math.max(0, change))}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-dashed border-muted-foreground/40 pt-2 text-center text-[11px] text-muted-foreground">
              Thank you!
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t bg-card/70 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl"
            onClick={() => {
              // TODO: wire backend payment flow.
              onOpenChange?.(false);
            }}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CashierPaymentModal;
