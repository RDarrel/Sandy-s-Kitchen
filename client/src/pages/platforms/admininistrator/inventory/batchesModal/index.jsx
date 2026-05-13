import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Boxes,
  CalendarClock,
  LoaderCircle,
  PackageCheck,
  Search,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter, Stock } from "@/services/utilities";
import { TOGGLE_BATCHES_MODAL } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_STOCK_BATCH } from "@/services/redux/slices/inventory/stockBatch";
import { capitalize } from "lodash";

const DAY_MS = 24 * 60 * 60 * 1000;

const getExpiryStatus = (expiryDate, soonDays = 14) => {
  if (!expiryDate) return "unknown";
  const today = new Date();
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return "unknown";

  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / DAY_MS);
  if (diffDays < 0) return "expired";
  if (diffDays <= soonDays) return "expiring soon";
  return "good";
};

const getBatchState = (remainingQuantity) => {
  const remaining = Number(remainingQuantity ?? 0);
  if (Number.isNaN(remaining)) return "consumed";
  return remaining > 0 ? "active" : "consumed";
};

const statusBadge = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "active") return { label: "Active", className: "bg-emerald-600" };
  if (key === "consumed")
    return { label: "Consumed", className: "bg-muted text-foreground" };
  if (key === "not tracked")
    return { label: "Not Tracked", className: "bg-muted text-foreground" };
  if (key === "expired") return { label: "Expired", className: "bg-red-600" };
  if (key === "expiring soon")
    return { label: "Expiring Soon", className: "bg-amber-500" };
  if (key === "good") return { label: "Good", className: "bg-emerald-600" };
  return { label: "Unknown", className: "bg-muted text-foreground" };
};

const toBatchCode = (index) => {
  const number = String(index + 1).padStart(4, "0");
  return `Batch-${number}`;
};

const InventoryBatchesModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showBatchesModal, selected } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { collections: batches, isLoading } = useSelector(
    ({ stockBatch }) => stockBatch,
  );
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const selectedId = selected?._id;
  const tracksExpiration = Boolean(selected?.trackExpiration);
  const tableColSpan = tracksExpiration ? 7 : 6;
  const unit = Stock.getUnit(selected?.measurement);

  const formatQty = (value) => {
    if (value === null || value === undefined || value === "") return "—";

    if (typeof value === "number")
      return Stock.display(value, selected?.measurement);

    const raw = String(value);
    if (!unit) return raw;
    const hasUnit = new RegExp(`\\b${unit}\\b`, "i").test(raw);
    return hasUnit ? raw : `${raw} ${unit}`;
  };

  const toggle = () => dispatch(TOGGLE_BATCHES_MODAL());

  useEffect(() => {
    if (showBatchesModal && selectedId && token) {
      dispatch(
        BROWSE_STOCK_BATCH({ token, params: { inventory: selectedId } }),
      );
      setSearch("");
    }
  }, [dispatch, showBatchesModal, selectedId, token]);

  const rows = useMemo(() => {
    const keyword = String(search || "")
      .trim()
      .toLowerCase();
    const list = Array.isArray(batches) ? batches : [];
    const enriched = list.map((batch, index) => {
      const supplierName =
        batch?.purchase?.supplier?.name || batch?.supplier?.name || "Supplier";
      const receivedDate = batch?.createdAt;
      const expirationDate = tracksExpiration
        ? batch?.expirationDate || batch?.expiryAt
        : null;
      const state = getBatchState(
        batch?.remainingQuantity ?? batch?.remainingQty,
      );
      return {
        ...batch,
        supplierName,
        receivedDate,
        expirationDate,
        status: state,
        displayCode: toBatchCode(index),
      };
    });

    if (!keyword) return enriched;
    return enriched.filter((batch) => {
      const code = String(batch.displayCode || "").toLowerCase();
      const supplier = String(batch.supplierName || "").toLowerCase();
      return code.includes(keyword) || supplier.includes(keyword);
    });
  }, [batches, search]);

  const summary = useMemo(() => {
    const list = Array.isArray(batches) ? batches : [];
    const enriched = list.map((batch) => {
      if (!tracksExpiration) return { ...batch, status: "not tracked" };
      const expirationDate = batch?.expirationDate || batch?.expiryAt;
      return { ...batch, status: getExpiryStatus(expirationDate) };
    });
    const totalQty = enriched.reduce(
      (sum, batch) =>
        sum + Number(batch?.remainingQuantity ?? batch?.remainingQty ?? 0),
      0,
    );
    const expiringSoon = tracksExpiration
      ? enriched.filter((batch) => batch.status === "expiring soon").length
      : 0;
    const expired = tracksExpiration
      ? enriched.filter((batch) => batch.status === "expired").length
      : 0;
    return { totalQty, expiringSoon, expired };
  }, [batches, tracksExpiration]);

  const availableStockLabel = Stock.display(
    summary.totalQty,
    selected?.measurement,
  );

  return (
    <Dialog open={showBatchesModal} onOpenChange={toggle}>
      <DialogContent className="border-border bg-card p-5 sm:max-w-5xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Boxes className="h-5 w-5" />
            Stock Batches — {capitalize(selected?.name || "Selected Item")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="group flex items-center justify-between rounded-xl border border-emerald-500/25 bg-card px-4 py-3 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                  AVAILABLE
                </p>
                <Badge className="h-5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  {availableStockLabel}
                </Badge>
              </div>
              <p className="text-xs text-emerald-900/70 dark:text-emerald-100/70">
                Items ready to use
              </p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-200">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>

          <div
            className={
              tracksExpiration
                ? "group flex items-center justify-between rounded-xl border border-amber-500/25 bg-card px-4 py-3 shadow-sm"
                : "group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm opacity-70"
            }
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p
                  className={
                    tracksExpiration
                      ? "text-[11px] font-semibold tracking-[0.14em] text-amber-700 dark:text-amber-300"
                      : "text-[11px] font-semibold tracking-[0.14em] text-muted-foreground"
                  }
                >
                  EXPIRING SOON
                </p>
                <Badge
                  className={
                    tracksExpiration
                      ? "h-5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 text-xs font-semibold text-amber-800 dark:text-amber-200"
                      : "h-5 rounded-full border border-border bg-muted px-2 text-xs font-semibold text-foreground"
                  }
                >
                  {tracksExpiration ? summary.expiringSoon : "N/A"}
                </Badge>
              </div>
              <p
                className={
                  tracksExpiration
                    ? "text-xs text-amber-900/70 dark:text-amber-100/70"
                    : "text-xs text-muted-foreground"
                }
              >
                {tracksExpiration
                  ? "Reorder / use first"
                  : "Expiration not tracked"}
              </p>
            </div>
            <div
              className={
                tracksExpiration
                  ? "grid h-9 w-9 place-items-center rounded-full bg-amber-600/15 text-amber-700 dark:text-amber-200"
                  : "grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground"
              }
            >
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>

          <div
            className={
              tracksExpiration
                ? "group flex items-center justify-between rounded-xl border border-red-500/25 bg-card px-4 py-3 shadow-sm"
                : "group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm opacity-70"
            }
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p
                  className={
                    tracksExpiration
                      ? "text-[11px] font-semibold tracking-[0.14em] text-red-700 dark:text-red-300"
                      : "text-[11px] font-semibold tracking-[0.14em] text-muted-foreground"
                  }
                >
                  EXPIRED
                </p>
                <Badge
                  className={
                    tracksExpiration
                      ? "h-5 rounded-full border border-red-500/25 bg-red-500/10 px-2 text-xs font-semibold text-red-800 dark:text-red-200"
                      : "h-5 rounded-full border border-border bg-muted px-2 text-xs font-semibold text-foreground"
                  }
                >
                  {tracksExpiration ? summary.expired : "N/A"}
                </Badge>
              </div>
              <p
                className={
                  tracksExpiration
                    ? "text-xs text-red-900/70 dark:text-red-100/70"
                    : "text-xs text-muted-foreground"
                }
              >
                {tracksExpiration ? "Needs disposal" : "Expiration not tracked"}
              </p>
            </div>
            <div
              className={
                tracksExpiration
                  ? "grid h-9 w-9 place-items-center rounded-full bg-red-600/15 text-red-700 dark:text-red-200"
                  : "grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground"
              }
            >
              <TriangleAlert className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{rows.length}</span>{" "}
            batch{rows.length === 1 ? "" : "es"}
          </p>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-9"
              placeholder="Search batch code / supplier"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[7px] border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right">Received Qty</TableHead>
                <TableHead className="text-right">Remaining Qty</TableHead>
                <TableHead>Received Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="text-center">Status</TableHead>
                {tracksExpiration ? (
                  <TableHead className="text-center">Action</TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColSpan}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40">
                        <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Loading batches
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please wait a moment...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((batch) => {
                  const badge = statusBadge(batch.status);
                  return (
                    <TableRow key={batch._id}>
                      <TableCell className="whitespace-normal">
                        <p className="font-medium text-foreground">
                          {batch.displayCode}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {batch.supplierName}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-normal text-muted-foreground">
                        {formatQty(batch?.qtyDisplay)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatQty(batch?.remainingQtyDisplay)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {batch.receivedDate
                          ? Formatter.date(batch.receivedDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {batch.expirationDate
                          ? Formatter.date(batch.expirationDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={badge.className}>{badge.label}</Badge>
                      </TableCell>
                      {tracksExpiration ? (
                        <TableCell className="text-center">
                          <Button type="button" size="sm" variant="outline">
                            View
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColSpan}
                    className="py-12 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      No batches matched your search.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryBatchesModal;
