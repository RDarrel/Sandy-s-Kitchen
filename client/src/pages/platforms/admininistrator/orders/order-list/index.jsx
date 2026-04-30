import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import IncomingOrdersTab from "./tabs/incoming";
import ReceivedOrdersTab from "./tabs/delivered";
import { Search, Truck } from "lucide-react";

const incomingStatuses = new Set([
  "pending",
  "request",
  "incoming",
  "redelivery",
]);
const receivedStatuses = new Set([
  "received",
  "resolved",
  "refunded",
  "cancelled",
]);

const getPurchaseStatus = (purchase) =>
  String(purchase?.status || "pending").toLowerCase();

const OrderList = () => {
  const { collections, isLoading } = useSelector(({ purchases }) => purchases);

  const [tab, setTab] = useState("incoming");
  const [query, setQuery] = useState("");

  const purchases = Array.isArray(collections) ? collections : [];

  const counts = useMemo(() => {
    let incoming = 0;
    let received = 0;

    for (const purchase of purchases) {
      const status = getPurchaseStatus(purchase);
      if (receivedStatuses.has(status)) received += 1;
      else if (incomingStatuses.has(status) || status) incoming += 1;
    }

    return { incoming, received };
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    const normalizedQuery = String(query || "")
      .trim()
      .toLowerCase();
    if (!normalizedQuery) return purchases;

    return purchases.filter((purchase) => {
      const supplierName =
        purchase?.supplier?.name ||
        purchase?.supplier?.company ||
        purchase?.supplier?.label ||
        "";

      const status = getPurchaseStatus(purchase);
      const totalAmount = String(purchase?.totalAmount ?? "");
      const createdAt = String(purchase?.createdAt ?? "");

      return (
        String(supplierName).toLowerCase().includes(normalizedQuery) ||
        status.includes(normalizedQuery) ||
        totalAmount.includes(normalizedQuery) ||
        createdAt.toLowerCase().includes(normalizedQuery) ||
        String(purchase?._id || "")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [purchases, query]);

  const incomingOrders = useMemo(
    () =>
      filteredPurchases.filter((purchase) => {
        const status = getPurchaseStatus(purchase);
        if (receivedStatuses.has(status)) return false;
        return incomingStatuses.has(status) || Boolean(status);
      }),
    [filteredPurchases],
  );

  const receivedOrders = useMemo(
    () =>
      filteredPurchases.filter((purchase) =>
        receivedStatuses.has(getPurchaseStatus(purchase)),
      ),
    [filteredPurchases],
  );

  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
          <Card className="bg-card/60 py-0 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <CardHeader className="gap-3 border-b border-border/70 px-5 pb-4 pt-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/70 shadow-sm">
                    <Truck className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg">Supplier orders</CardTitle>
                    <CardDescription className="text-sm">
                      Track purchase orders from request to receiving.
                    </CardDescription>
                  </div>
                </div>

                <div className="relative w-full sm:w-96">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search supplier, status, amount..."
                    className="h-10 bg-background/60 pl-9"
                  />
                </div>
              </div>

              <TabsList className="h-10 w-fit rounded-full border border-border bg-muted/30 p-1">
                <TabsTrigger
                  value="incoming"
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Incoming
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0 text-[11px]"
                  >
                    {counts.incoming}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="received"
                  className="gap-2 rounded-full px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Received
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0 text-[11px]"
                  >
                    {counts.received}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="px-5 pb-4 pt-3 sm:px-6">
              <TabsContent value="incoming" className="mt-0">
                <IncomingOrdersTab
                  orders={incomingOrders}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent value="received" className="mt-0">
                <ReceivedOrdersTab
                  orders={receivedOrders}
                  isLoading={isLoading}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default memo(OrderList);
