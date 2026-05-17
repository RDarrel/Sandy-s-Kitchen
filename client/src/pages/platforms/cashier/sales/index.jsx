import React, { useMemo } from "react";
import {
  PhilippinePeso,
  ReceiptText,
  ShoppingBasket,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

const KPI = ({ title, value, helper, icon: Icon, trend }) => (
  <Card className="relative overflow-hidden transition-shadow hover:shadow-sm">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">{title}</p>
        <div className="flex items-end gap-2">
          <p className="text-xl font-semibold leading-none tracking-tight">
            {value}
          </p>
          {typeof trend === "number" ? (
            <Badge
              variant="secondary"
              className={cn(
                "h-5 px-2 text-[11px]",
                trend >= 0
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-rose-500/10 text-rose-700",
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </Badge>
          ) : null}
        </div>
        {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
      </div>
      <div className="bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md border">
        {React.createElement(Icon, { className: "h-4 w-4" })}
      </div>
    </CardHeader>
  </Card>
);

const PaymentBadge = ({ method }) => {
  const mapped = String(method || "").toLowerCase();
  const ui =
    mapped === "cash"
      ? { className: "bg-emerald-500/10 text-emerald-700", label: "Cash" }
      : mapped === "gcash"
        ? { className: "bg-sky-500/10 text-sky-800", label: "GCash" }
        : mapped === "card"
          ? { className: "bg-violet-500/10 text-violet-800", label: "Card" }
          : { className: "", label: method || "—" };

  return (
    <Badge variant="secondary" className={cn("h-5 px-2 text-[11px]", ui.className)}>
      {ui.label}
    </Badge>
  );
};

const Sales = () => {
  const mockSales = useMemo(
    () => [
      {
        id: "TXN-000231",
        time: "May 18, 2026 • 11:06 AM",
        items: 5,
        method: "Cash",
        total: 1434.0,
      },
      {
        id: "TXN-000232",
        time: "May 18, 2026 • 11:24 AM",
        items: 2,
        method: "GCash",
        total: 215.0,
      },
      {
        id: "TXN-000233",
        time: "May 18, 2026 • 12:02 PM",
        items: 8,
        method: "Cash",
        total: 2120.5,
      },
      {
        id: "TXN-000234",
        time: "May 18, 2026 • 12:41 PM",
        items: 3,
        method: "Card",
        total: 498.0,
      },
      {
        id: "TXN-000235",
        time: "May 18, 2026 • 01:09 PM",
        items: 1,
        method: "Cash",
        total: 89.0,
      },
    ],
    [],
  );

  const rows = mockSales;

  const summary = useMemo(() => {
    const totalSales = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    const orders = rows.length;
    const itemsSold = rows.reduce((sum, row) => sum + (Number(row.items) || 0), 0);
    const avgOrder = orders ? totalSales / orders : 0;
    return { totalSales, orders, itemsSold, avgOrder };
  }, [rows]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Cashier Sales</CardTitle>
            <p className="text-muted-foreground text-xs">
              Daily snapshot (mock data for now)
            </p>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPI
              title="Total Sales"
              value={format.peso(summary.totalSales)}
              helper="Gross sales (today)"
              icon={PhilippinePeso}
              trend={8.4}
            />
            <KPI
              title="Orders"
              value={summary.orders}
              helper="Transactions processed"
              icon={ReceiptText}
              trend={3.2}
            />
            <KPI
              title="Items Sold"
              value={summary.itemsSold}
              helper="Total line items sold"
              icon={ShoppingBasket}
            />
            <KPI
              title="Avg Order"
              value={format.peso(summary.avgOrder)}
              helper="Average ticket size"
              icon={TrendingUp}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              Showing {rows.length} transactions
            </p>
            <Badge variant="outline" className="h-7 rounded-full px-3">
              Total: {format.peso(summary.totalSales)}
            </Badge>
          </div>

          <Separator className="my-3" />
          <div className="overflow-auto rounded-xl border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted/70">
                <TableRow>
                  <TableHead className="w-[160px]">Transaction</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.time}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.items}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge method={row.method} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {format.peso(row.total)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
