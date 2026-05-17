import React, { useMemo, useState } from "react";
import { Eye, Printer, Search, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "@/services/utilities";
import { useSelector } from "react-redux";
import ViewReceiptModal from "@/components/shared/view-receipt";
import TableLoading from "@/components/shared/loading/table";

const formatDateTime = (value) => {
  try {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const SummaryLine = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="shrink-0 text-sm font-medium text-foreground">
      {label}
    </span>
    <span className="h-0 flex-1 border-t border-dashed border-border/80" />
    <span className="shrink-0 text-base font-bold tabular-nums text-primary">
      {value}
    </span>
  </div>
);

const Sales = () => {
  const { sales, isLoadingSales } = useSelector(({ cashier }) => cashier);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [transactionQuery, setTransactionQuery] = useState("");
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

  const filteredRows = useMemo(() => {
    const q = String(transactionQuery || "")
      .trim()
      .toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.id.toLowerCase().includes(q));
  }, [rows, transactionQuery]);

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
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
      <Card className="overflow-hidden bg-card">
        <CardHeader className="gap-3 -mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base">
                Today&apos;s Transactions
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                View transactions and receipts.
              </p>
            </div>

            <div className="w-full sm:w-[260px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={transactionQuery}
                  onChange={(e) => setTransactionQuery(e.target.value)}
                  placeholder="Search transaction Id..."
                  className="h-10 rounded-md pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SummaryLine label="Sales" value={format.peso(summary.totalSales)} />

          <div className="overflow-auto max-h-[64vh] rounded-md border border-border bg-background">
            <Table className="w-full ">
              <TableHeader className="sticky top-0 z-10 bg-muted/70">
                <TableRow>
                  <TableHead className="w-[190px] whitespace-nowrap">
                    Transaction Id
                  </TableHead>
                  <TableHead className="w-[170px] whitespace-nowrap">
                    Time
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
                  <TableLoading />
                ) : filteredRows.length ? (
                  filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap  text-muted-foreground">
                        {row.id}
                      </TableCell>
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
                    <TableCell colSpan={5} className="p-0">
                      <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <ReceiptText className="h-7 w-7 text-muted-foreground" />
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {transactionQuery.trim()
                              ? "No matching transactions"
                              : "No sales yet"}
                          </p>

                          <p className="max-w-sm text-sm text-muted-foreground">
                            {transactionQuery.trim()
                              ? "Try searching with a different transaction ID."
                              : "Completed sales transactions will appear here."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ViewReceiptModal
        isOpen={viewOpen}
        setIsOpen={(open) => {
          setViewOpen(open);
          if (!open) setSelectedSale(null);
        }}
        order={selectedSale}
      />
    </div>
  );
};

export default Sales;
