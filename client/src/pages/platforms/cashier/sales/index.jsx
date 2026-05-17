import React, { useEffect, useMemo, useState } from "react";
import { Eye, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE_SALES } from "@/services/redux/slices/stations/cashier";

const formatDateTime = (value) => {
  try {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const SummaryLine = ({ label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="shrink-0 font-medium">{label}</span>
    <span className="h-0 flex-1 border-t border-dashed border-border" />
    <span className="shrink-0 font-semibold tabular-nums">{value}</span>
  </div>
);

const PaymentBadge = ({ method }) => {
  const mapped = String(method || "").toLowerCase();
  const ui =
    mapped === "cash"
      ? { className: "bg-primary/10 text-primary", label: "Cash" }
      : mapped === "gcash"
        ? {
            className: "bg-secondary text-secondary-foreground",
            label: "GCash",
          }
        : mapped === "card"
          ? { className: "bg-muted text-foreground", label: "Card" }
          : { className: "bg-muted text-foreground", label: method || "—" };

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium",
        ui.className,
      )}
    >
      {ui.label}
    </span>
  );
};
const Sales = () => {
  const { sales, isLoadingSales } = useSelector(({ cashier }) => cashier);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const rows = useMemo(() => {
    const list = Array.isArray(sales) ? sales : [];

    return list.map((order) => {
      const items = Array.isArray(order?.items) ? order.items : [];
      const itemsCount = items.length;

      const createdAt =
        order?.created?.at ?? order?.createdAt ?? order?.updatedAt ?? null;

      return {
        id: String(order?._id || ""),
        time: formatDateTime(createdAt),
        itemsCount,
        total: Number(order?.amount ?? 0) || 0,
        raw: order,
      };
    });
  }, [sales]);

  const handlePrint = (order) => {
    try {
      localStorage.setItem("order-printout", JSON.stringify(order));
      window.open(
        "/receipts/order",
        "Order Receipt",
        "top=100px,left=500px,width=420px,height=780px",
      );
    } catch {
      window.print();
    }
  };

  const summary = useMemo(() => {
    const totalSales = rows.reduce(
      (sum, row) => sum + (Number(row.total) || 0),
      0,
    );
    return { totalSales };
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
      <Card className="overflow-hidden bg-card">
        <CardHeader className="-mb-2">
          <div className="space-y-1">
            <CardTitle className="text-base">Today's Transactions</CardTitle>
            <p className="text-muted-foreground text-xs">
              Recent transactions and total sales today.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SummaryLine label="Sales" value={format.peso(summary.totalSales)} />

          <div className="overflow-auto rounded-xl border border-border bg-background">
            <Table className="w-full table-fixed">
              <TableHeader className="sticky top-0 z-10 bg-muted/60">
                <TableRow>
                  <TableHead className="w-[170px] whitespace-nowrap">
                    Date/Time
                  </TableHead>
                  <TableHead className="w-[70px] whitespace-nowrap text-right">
                    Items
                  </TableHead>
                  <TableHead className="w-[130px] whitespace-nowrap text-right">
                    Total Amount
                  </TableHead>
                  <TableHead className="w-[96px] whitespace-nowrap text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingSales ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-10 text-center"
                    >
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {row.time}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.itemsCount}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {format.peso(row.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 rounded-lg p-0"
                            onClick={() => {
                              setSelectedSale(row.raw);
                              setViewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 rounded-lg p-0"
                            onClick={() => handlePrint(row.raw)}
                          >
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground py-10 text-center"
                    >
                      No sales found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setSelectedSale(null);
        }}
      >
        <DialogContent className="max-w-md">
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                {selectedSale?._id || "Transaction"}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDateTime(
                  selectedSale?.created?.at ??
                    selectedSale?.createdAt ??
                    selectedSale?.updatedAt,
                )}
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-background p-3">
              <SummaryLine
                label="Items"
                value={
                  Array.isArray(selectedSale?.items)
                    ? selectedSale.items.reduce(
                        (sum, item) => sum + (Number(item?.quantity) || 0),
                        0,
                      )
                    : "—"
                }
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Payment</span>
                <PaymentBadge method="Cash" />
              </div>
              <SummaryLine
                label="Total"
                value={format.peso(selectedSale?.amount || 0)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setViewOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                className="rounded-xl gap-2"
                onClick={() => handlePrint(selectedSale)}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
