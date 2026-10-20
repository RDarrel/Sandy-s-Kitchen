import { Truck, ChevronRight } from "lucide-react";
import {
  DashboardEmptyState,
  DashboardFeedback,
  ReportLink,
} from "../components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GET_INCOMING_DELIVERIES } from "@/services/redux/slices/dashboard";
import { useDispatch, useSelector } from "react-redux";
import { IncomingDeliveriesSkeleton } from "../skeletons";
import { mapDelivery } from "../data";
import { Formatter } from "@/services/utilities";
import { Badge } from "@/components/ui/badge";

const IncomingDeliveries = ({ errors }) => {
  const { isLoadingDeliveries, incomingDeliveries: deliveryReport } =
    useSelector(({ dashboard }) => dashboard);
  const dispatch = useDispatch();

  const incomingDeliveries = (deliveryReport?.deliveries || []).map(
    mapDelivery,
  );

  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm">
      <CardHeader className="px-5 pb-0 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
              <Truck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                Incoming Deliveries
              </CardTitle>
              <p className="text-xs leading-4 text-muted-foreground">
                Pending supplier deliveries
              </p>
            </div>
          </div>
          <ReportLink to="/platforms/orders/order-list">
            View Orders <ChevronRight className="size-3.5" aria-hidden="true" />
          </ReportLink>
        </div>
      </CardHeader>
      {isLoadingDeliveries ? (
        <IncomingDeliveriesSkeleton />
      ) : errors.incomingDeliveries ? (
        <DashboardFeedback
          error={errors.incomingDeliveries}
          onRetry={() => dispatch(GET_INCOMING_DELIVERIES())}
        />
      ) : incomingDeliveries.length ? (
        <>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="pl-5 text-xs">
                    Supplier / Order
                  </TableHead>
                  <TableHead className="text-xs">Expected</TableHead>
                  <TableHead className="text-right text-xs">Status</TableHead>
                  <TableHead className="pr-5 text-right text-xs">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingDeliveries.map((delivery) => (
                  <TableRow key={delivery.id} className="h-16 last:border-b-0">
                    <TableCell className="pl-5">
                      <p className="text-xs font-medium">{delivery.supplier}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {delivery.reference}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {delivery.expected}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      <Badge
                        variant="outline"
                        className="whitespace-nowrap border-chart-3/25 bg-chart-3/10 text-[10px] font-medium"
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-5 text-right text-xs font-semibold tabular-nums">
                      {Formatter.amount(delivery.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </>
      ) : (
        <DashboardEmptyState
          icon={Truck}
          title="No incoming deliveries"
          description="Supplier orders will appear here when deliveries are scheduled."
        />
      )}
    </Card>
  );
};

export default IncomingDeliveries;
