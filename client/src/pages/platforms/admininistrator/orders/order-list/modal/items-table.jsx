import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { Package } from "lucide-react";
import {
  formatQty,
  getItemKey,
  getOrderedQty,
  getUnitCost,
  normalizeQtyInput,
  round2,
  toNumber,
} from "./utils";

const ReceiveOrderItemsTable = ({
  items = [],
  receivedByKey,
  setReceivedByKey,
  expiryByKey,
  setExpiryByKey,
  minExpiryDate,
  counts,
  grandSubtotal,
  grandVariance,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <Table className="min-w-[980px]">
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-muted/30">
            <TableHead className="px-5 text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Item
              </span>
            </TableHead>
            <TableHead className="px-5 text-right text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Ordered Qty
            </TableHead>
            <TableHead className="w-[280px] px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Received Qty
            </TableHead>
            <TableHead className="px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Expiration Date
            </TableHead>
            <TableHead className="w-[220px] px-5 text-center text-[11px] font-semibold  tracking-wide text-muted-foreground/90">
              Short Qty
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item) => {
            const key = getItemKey(item);
            const name = item?.inventory?.name || item?.name || "Item";
            const unitRaw = String(item?.unit || "").trim();
            const unit = capitalize(unitRaw) || "";
            const expected = round2(getOrderedQty(item));
            const received = round2(toNumber(receivedByKey[key]));
            const discrepancy = round2(expected - received);
            const hasMismatch = discrepancy !== 0;
            const isOver = discrepancy < 0;
            const shortQty = Math.max(0, discrepancy);
            const unitCost = getUnitCost(item);
            const shortAmount =
              unitCost === null ? null : Math.max(0, shortQty) * unitCost;
            const receivedAmount =
              unitCost === null ? null : Math.max(0, received) * unitCost;
            const tracksExpiration = Boolean(
              item?.inventory?.trackExpiration ??
              item?.trackExpiration ??
              false,
            );

            const inputHighlightClass = hasMismatch
              ? isOver
                ? "border-destructive/60 focus-visible:ring-destructive/20"
                : "border-accent/60 focus-visible:ring-accent/20"
              : "";

            return (
              <TableRow
                key={key || name}
                className={`hover:bg-muted/5 ${hasMismatch ? "bg-destructive/5" : ""}`}
              >
                <TableCell className="whitespace-normal px-5 py-2.5">
                  <p className="truncate font-medium text-foreground">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                      {unit || "-"}
                    </span>
                    {unitCost === null ? (
                      <span>Unit cost: -</span>
                    ) : (
                      <span>
                        Unit cost:{" "}
                        <span className="font-medium text-foreground/80">
                          {Formatter.amount(unitCost)}
                        </span>
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-5 py-2.5 text-right font-semibold tabular-nums text-foreground">
                  {formatQty(expected)}{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    {unit || "-"}
                  </span>
                </TableCell>

                <TableCell className="w-[280px] px-5 py-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <Label className="sr-only" htmlFor={`received-${key}`}>
                      Received quantity
                    </Label>
                    <div className="relative w-[140px]">
                      <Input
                        id={`received-${key}`}
                        type="number"
                        min={1}
                        max={expected}
                        step="0.01"
                        inputMode="decimal"
                        value={receivedByKey[key] ?? ""}
                        onKeyDown={(event) => {
                          if (
                            event.key === "e" ||
                            event.key === "E" ||
                            event.key === "+" ||
                            event.key === "-"
                          ) {
                            event.preventDefault();
                          }
                        }}
                        onChange={(event) => {
                          const raw = event.target.value;
                          if (raw === "") {
                            setReceivedByKey((prev) => ({
                              ...prev,
                              [key]: "",
                            }));
                            return;
                          }

                          const nextNumber = Number(raw);
                          const clampedNumber = Math.min(
                            expected,
                            Math.max(
                              0,
                              Number.isFinite(nextNumber) ? nextNumber : 0,
                            ),
                          );
                          setReceivedByKey((prev) => ({
                            ...prev,
                            [key]: clampedNumber,
                          }));
                        }}
                        onBlur={(event) => {
                          const raw = event.target.value;
                          if (raw === "") {
                            setReceivedByKey((prev) => ({
                              ...prev,
                              [key]: "",
                            }));
                            return;
                          }

                          const normalized = Number(normalizeQtyInput(raw));
                          const clampedNumber = Math.min(
                            expected,
                            Math.max(
                              0,
                              Number.isFinite(normalized) ? normalized : 0,
                            ),
                          );
                          setReceivedByKey((prev) => ({
                            ...prev,
                            [key]: clampedNumber,
                          }));
                        }}
                        placeholder="0"
                        className={`h-8 w-full bg-background pr-12 text-right tabular-nums ${inputHighlightClass}`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {unit || "-"}
                      </span>
                    </div>

                    <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Total amount</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {receivedAmount === null
                          ? "-"
                          : Formatter.amount(receivedAmount)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-2.5">
                  <div className="mx-auto w-[150px]">
                    <Label className="sr-only" htmlFor={`expiry-${key}`}>
                      Expiration date
                    </Label>
                    <Input
                      id={`expiry-${key}`}
                      type="date"
                      required
                      min={minExpiryDate}
                      value={tracksExpiration ? (expiryByKey[key] ?? "") : ""}
                      disabled={!tracksExpiration}
                      onChange={(event) => {
                        if (!tracksExpiration) return;
                        const raw = event.target.value;
                        setExpiryByKey((prev) => ({
                          ...prev,
                          [key]: raw,
                        }));
                      }}
                      className="h-8 w-full bg-background text-sm disabled:cursor-not-allowed disabled:bg-muted/30"
                    />
                  </div>
                </TableCell>

                <TableCell className="w-[220px] px-5 py-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative w-[140px]">
                      <Input
                        type="text"
                        value={formatQty(shortQty)}
                        disabled
                        className={`h-8 w-full border-dashed bg-muted/20 pr-12 text-right font-semibold tabular-nums disabled:cursor-not-allowed disabled:opacity-100 ${shortQty > 0 ? "border-destructive/40 text-destructive" : "border-border/70 text-muted-foreground"}`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {unit || "-"}
                      </span>
                    </div>
                    <div className="flex w-[140px] items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Total amount</span>
                      <span
                        className={`font-semibold tabular-nums ${shortQty > 0 ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {shortAmount === null
                          ? "-"
                          : Formatter.amount(shortAmount)}
                      </span>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-2 border-t border-border bg-muted/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {counts.flagged
            ? `${counts.flagged} items do not match the order.`
            : "All items match the order.."}
        </div>
        <div className="flex items-baseline justify-between gap-6 sm:justify-end">
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
              Total Received
            </span>
            <div className="text-base font-semibold tabular-nums text-foreground">
              {Formatter.amount(grandSubtotal)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
              Total Difference
            </span>
            <div
              className={`text-base font-semibold tabular-nums ${grandVariance === 0 ? "text-muted-foreground" : "text-destructive"}`}
            >
              {Formatter.amount(grandVariance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveOrderItemsTable;
