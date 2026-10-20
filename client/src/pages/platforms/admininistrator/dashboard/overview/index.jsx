import { ChartColumn, PhilippinePeso } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GET_COLLECTIONS } from "@/services/redux/slices/dashboard";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { buildCollectionSeries, getCollectionRange } from "../data";
import Chart from "./chart";
import Donut from "./donut";
import {
  CollectionsDonutSkeleton,
  DashboardEmptyState,
  DashboardFeedback,
} from "./components";

const Overview = ({ range, errors }) => {
  const { isLoadingCollections, collections } = useSelector(
    ({ dashboard }) => dashboard,
  );
  const [revenueFrequency, setRevenueFrequency] = useState("week");
  const dispatch = useDispatch();

  const revenueRange = useMemo(
    () => getCollectionRange(range, revenueFrequency),
    [range, revenueFrequency],
  );
  const series = useMemo(
    () => buildCollectionSeries(collections?.overview, revenueRange),
    [collections?.overview, revenueRange],
  );
  const { startDate, endDate } = range;
  const { frequency } = revenueRange;

  useEffect(() => {
    const request = dispatch(
      GET_COLLECTIONS({ startDate, endDate, frequency }),
    );
    return () => request.abort();
  }, [dispatch, startDate, endDate, frequency]);

  const totalRevenue = Number(collections?.totalCollections ?? 0);

  const channelData = (collections?.bySource || []).filter((entry) =>
    ["booking", "pos"].includes(entry.name),
  );
  const hasCollections = (collections?.overview || []).some(
    (entry) => Number(entry.booking) > 0 || Number(entry.pos) > 0,
  );

  const revenueData = { label: revenueRange.label, series };

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-8">
        <CardHeader className="px-5 pb-0 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
                <ChartColumn className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                  Collections Overview
                </CardTitle>
                <p className="text-xs leading-4 text-muted-foreground">
                  {revenueData.label}
                </p>
              </div>
            </div>
            <Select
              value={revenueFrequency}
              onValueChange={setRevenueFrequency}
            >
              <SelectTrigger
                aria-label="Collections frequency"
                className="h-9 w-[116px] rounded-md bg-muted/25 text-xs font-medium shadow-none hover:bg-muted/50 focus-visible:ring-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-3 pt-5">
          {!isLoadingCollections && errors.collections ? (
            <DashboardFeedback
              error={errors.collections}
              onRetry={() =>
                dispatch(GET_COLLECTIONS({ startDate, endDate, frequency }))
              }
            />
          ) : !isLoadingCollections && !hasCollections ? (
            <DashboardEmptyState
              icon={ChartColumn}
              title="No collections recorded"
              description="Booking payments and POS sales for this period will appear here."
            />
          ) : (
            <Chart series={revenueData.series} loading={isLoadingCollections} />
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 gap-0 overflow-hidden rounded-xl py-0 shadow-sm lg:col-span-4">
        <CardHeader className="px-5 pb-0 pt-3">
          <div className="flex items-center gap-3 border-b pb-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground">
              <PhilippinePeso className="size-[18px]" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold leading-5 tracking-tight">
                Collections by Source
              </CardTitle>
              <p className="text-xs leading-4 text-muted-foreground">
                {revenueData.label}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center px-3 py-5">
          {isLoadingCollections ? (
            <CollectionsDonutSkeleton />
          ) : errors.collections ? (
            <DashboardFeedback
              error={errors.collections}
              onRetry={() =>
                dispatch(GET_COLLECTIONS({ startDate, endDate, frequency }))
              }
            />
          ) : !hasCollections ? (
            <DashboardEmptyState
              icon={PhilippinePeso}
              title="No collections recorded"
              description="The Booking and POS breakdown will appear once payments are received."
            />
          ) : (
            <Donut
              revenueFrequency={revenueFrequency}
              channelData={channelData}
              totalRevenue={totalRevenue}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
