import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BROWSE as BROWSE_INVENTORY } from "@/services/redux/slices/inventory/inventoryItems";
import { BROWSE as BROWSE_PURCHASES } from "@/services/redux/slices/procurement/purchases";
import { Formatter, Stock } from "@/services/utilities";
import {
  AlertTriangle,
  ClipboardList,
  Package,
  PackageCheck,
  PackageSearch,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const getInitials = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join("")
    .toUpperCase();

const getItemsFromPurchase = (purchase) => {
  if (!purchase) return [];
  const items = Array.isArray(purchase?.items)
    ? purchase.items
    : Array.isArray(purchase?.orders)
      ? purchase.orders
      : [];
  return Array.isArray(items) ? items : [];
};

const EXPIRING_SOON_DAYS = 7;
const formatDeliveryWindow = (deliveryWindow) => {
  const from = deliveryWindow?.from ? Formatter.date(deliveryWindow.from) : "";
  const to = deliveryWindow?.to ? Formatter.date(deliveryWindow.to) : "";
  if (from && to) return `${from} - ${to}`;
  return from || "Incoming";
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { token, auth } = useSelector(({ auth }) => auth);

  const { collections: inventory = [], isLoading: inventoryLoading } =
    useSelector(({ inventoryItems }) => inventoryItems);

  const [incomingOrders, setIncomingOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [receivedLoading, setReceivedLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    dispatch(BROWSE_INVENTORY({ token }));

    setIncomingLoading(true);
    dispatch(BROWSE_PURCHASES({ token, params: { status: "incoming" } }))
      .unwrap()
      .then(({ payload = [] } = {}) => setIncomingOrders(payload || []))
      .catch(() => setIncomingOrders([]))
      .finally(() => setIncomingLoading(false));

    setReceivedLoading(true);
    dispatch(BROWSE_PURCHASES({ token, params: { status: "received" } }))
      .unwrap()
      .then(({ payload = [] } = {}) => setReceivedOrders(payload || []))
      .catch(() => setReceivedOrders([]))
      .finally(() => setReceivedLoading(false));
  }, [dispatch, token]);

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeIncoming = Array.isArray(incomingOrders) ? incomingOrders : [];
  const safeReceived = Array.isArray(receivedOrders) ? receivedOrders : [];

  const inventorySummary = useMemo(() => {
    const outOfStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "out of stock",
    );
    const lowStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "low stock",
    );
    const inStock = safeInventory.filter(
      (item) => normalizeStatus(item?.stockStatus) === "in stock",
    );

    const needsReorder = [...outOfStock, ...lowStock];

    return {
      outCount: outOfStock.length,
      lowCount: lowStock.length,
      inCount: inStock.length,
      totalCount: safeInventory.length,
      needsReorder: needsReorder.slice(0, 8),
    };
  }, [safeInventory]);

  const incomingSummary = useMemo(() => {
    const totalAmount = safeIncoming.reduce(
      (acc, p) => acc + (Number(p?.totalAmount) || Number(p?.amount) || 0),
      0,
    );

    return {
      count: safeIncoming.length,
      totalAmount,
      recent: safeIncoming.slice(0, 6),
    };
  }, [safeIncoming]);

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + EXPIRING_SOON_DAYS);

    const rows = [];

    for (const purchase of safeReceived) {
      const items = getItemsFromPurchase(purchase);
      for (const item of Array.isArray(items) ? items : []) {
        const tracksExpiration = Boolean(
          item?.inventory?.trackExpiration ?? item?.trackExpiration ?? false,
        );
        if (!tracksExpiration) continue;

        const raw = item?.expirationDate;
        if (!raw) continue;

        const expiry = new Date(raw);
        if (Number.isNaN(expiry.getTime())) continue;
        if (expiry < now || expiry > cutoff) continue;

        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        const name = item?.inventory?.name || item?.name || "Item";

        rows.push({
          key: String(item?._id || item?.inventory?._id || name),
          name,
          expiry,
          daysLeft,
        });
      }
    }

    rows.sort((a, b) => a.expiry - b.expiry);

    return {
      count: rows.length,
      rows: rows.slice(0, 6),
    };
  }, [safeReceived]);

  return (
    <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/70 bg-muted/10 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-background">
                  <PackageSearch className="h-4 w-4 text-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-semibold text-foreground">
                    Overview
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track inventory status, deliveries, and expiration.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  className="gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Link to="/platforms/Manage-Orders/Order-Processing">
                    <ShoppingCart className="h-4 w-4" />
                    Request stock
                  </Link>
                </Button>

                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link to="/platforms/Manage-Orders/Order-Processing">
                    <ClipboardList className="h-4 w-4" />
                    Orders
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Link to="/platforms/Manage-Orders/Short-Deliveries">
                    <AlertTriangle className="h-4 w-4" />
                    Short deliveries
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-2 bg-muted/5 px-4 py-4 sm:px-6 lg:grid-cols-12">
            <div className="grid gap-2 lg:col-span-12 lg:grid-cols-12">
              <Card className="relative overflow-hidden lg:col-span-4 gap-4 py-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(20rem_12rem_at_0%_-20%,rgba(239,68,68,0.10),transparent_55%)]" />
                <CardHeader className="space-y-1 px-4 pt-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TriangleAlert className="h-4 w-4 text-destructive" />
                    Out of stock
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Immediate reorder required
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-3 px-4 pt-0 pb-0">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {inventorySummary.outCount}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {inventorySummary.totalCount} items tracked
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      inventorySummary.outCount
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : "border-border"
                    }
                  >
                    {inventorySummary.outCount ? "Urgent" : "OK"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden lg:col-span-4 gap-4 py-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(20rem_12rem_at_0%_-20%,rgba(245,158,11,0.12),transparent_55%)]" />
                <CardHeader className="space-y-1 px-4 pt-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    Low stock
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Below reorder level
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-3 px-4 pt-0 pb-0">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {inventorySummary.lowCount}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Watch</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      inventorySummary.lowCount
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-border"
                    }
                  >
                    {inventorySummary.lowCount ? "Reorder soon" : "OK"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden lg:col-span-4 gap-4 py-4">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(20rem_12rem_at_0%_-20%,rgba(16,185,129,0.10),transparent_55%)]" />
                <CardHeader className="space-y-1 px-4 pt-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                    In stock
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Healthy items
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-3 px-4 pt-0 pb-0">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {inventorySummary.inCount}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Inventory {inventoryLoading ? "syncing" : "updated"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {inventoryLoading ? "Loading..." : "Up to date"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-4 gap-4 py-4">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-4 pt-0 pb-2">
                <div>
                  <CardTitle className="text-sm">
                    Replenishment queue
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Out-of-stock items first, then low-stock items.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {inventorySummary.outCount + inventorySummary.lowCount} alerts
                </Badge>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                {inventorySummary.needsReorder.length ? (
                  <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
                    <Table className="w-full table-fixed">
                      <TableBody>
                        {inventorySummary.needsReorder.map((item, index) => {
                          const status = normalizeStatus(item?.stockStatus);
                          const isOut = status === "out of stock";

                          return (
                            <TableRow key={item?._id || index}>
                              <TableCell className="py-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {item?.name || "Item"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {Stock.display(
                                      item?.stockDisplay?.current,
                                      item?.measurement,
                                    )}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <Badge
                                  variant="outline"
                                  className={
                                    isOut
                                      ? "rounded-full border-destructive/30 bg-destructive/5 text-destructive"
                                      : "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  }
                                >
                                  {isOut ? "Out of stock" : "Low stock"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">
                    {inventoryLoading
                      ? "Loading inventory..."
                      : "No items need reorder right now."}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 gap-4 py-4">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-4 pt-0 pb-2">
                <div>
                  <CardTitle className="text-sm">Expiring soon</CardTitle>
                  <CardDescription>
                    Items expiring within {EXPIRING_SOON_DAYS} days.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={
                    expiringSoon.count
                      ? "rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "rounded-full"
                  }
                >
                  {receivedLoading
                    ? "Loading..."
                    : expiringSoon.count
                      ? `${expiringSoon.count} item(s)`
                      : "OK"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-3 pt-0">
                {expiringSoon.rows.length ? (
                  <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
                    <Table className="w-full table-fixed">
                      <TableBody>
                        {expiringSoon.rows.map((row) => (
                          <TableRow key={row.key}>
                            <TableCell className="py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {row.name}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  Expires {Formatter.date(row.expiry)} •{" "}
                                  {row.daysLeft} day(s)
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <Badge
                                variant="outline"
                                className="rounded-full border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              >
                                Soon
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {receivedLoading
                      ? "Loading expiry data..."
                      : "No items expiring soon."}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 gap-4 py-4">
              <CardHeader className="flex flex-row items-start justify-between gap-4 px-4 pt-0 pb-2">
                <div>
                  <CardTitle className="text-sm">
                    Incoming deliveries
                  </CardTitle>
                  <CardDescription>
                    Supplier orders to receive and verify.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {incomingLoading
                    ? "Loading..."
                    : incomingSummary.count
                      ? `${incomingSummary.count} incoming`
                      : "0"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-3 pt-0">
                {incomingSummary.recent.length ? (
                  <div className="max-h-64 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-background/40">
                    <Table className="w-full table-fixed">
                      <TableBody>
                        {incomingSummary.recent.map((purchase, index) => (
                          <TableRow
                            key={`${purchase?._id || purchase?.supplier?._id || "po"}_${index}`}
                          >
                            <TableCell className="max-w-0 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {purchase?.supplier?.name || "Supplier"}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {formatDeliveryWindow(
                                    purchase?.deliveryWindow,
                                  )}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <div className="flex justify-end">
                                <Badge
                                  variant="outline"
                                  className="gap-1 rounded-full whitespace-nowrap"
                                >
                                  <PackageSearch className="h-3.5 w-3.5" />
                                  View
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {incomingLoading
                      ? "Loading orders..."
                      : "No incoming orders."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
