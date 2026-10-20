import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  booking: { label: "Booking", color: "var(--primary)" },
  pos: { label: "POS", color: "var(--chart-3)" },
};

const Chart = ({ series, loading }) => {
  const chartData = useMemo(() => {
    if (!loading) return series;
    const heights = [
      [54, 32],
      [72, 44],
      [46, 30],
      [82, 53],
      [65, 41],
      [90, 62],
      [58, 38],
    ];
    return series.map((entry, index) => ({
      ...entry,
      booking: heights[index % heights.length][0],
      pos: heights[index % heights.length][1],
    }));
  }, [series, loading]);

  return (
    <div
      role={loading ? "status" : undefined}
      aria-label={loading ? "Loading collections overview" : undefined}
      className="min-w-0 w-full"
    >
      <div
        aria-hidden={loading || undefined}
        className="mb-4 flex h-[18px] items-center justify-between gap-3"
      >
        {loading ? (
          <Skeleton className="h-2.5 w-16" />
        ) : (
          <span className="text-[11px] text-muted-foreground">
            Amount (PHP)
          </span>
        )}
        <div className="flex gap-4">
          {loading ? (
            [0, 1].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-2.5 w-10" />
              </div>
            ))
          ) : (
            <>
              <Legend color="bg-primary">Booking</Legend>
              <Legend color="bg-chart-3">POS</Legend>
            </>
          )}
        </div>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[240px] w-full aspect-auto sm:h-[260px]"
        aria-hidden={loading || undefined}
      >
        <BarChart
          accessibilityLayer={!loading}
          data={chartData}
          margin={{ top: 10, right: 5, left: -12, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="date"
            height={30}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            minTickGap={15}
            fontSize={11}
            tick={loading ? <CollectionsAxisSkeleton axis="x" /> : true}
          />
          <YAxis
            width={60}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            domain={loading ? [0, 100] : [0, "auto"]}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en", { notation: "compact" }).format(value)
            }
            tick={loading ? <CollectionsAxisSkeleton axis="y" /> : true}
          />
          <ChartTooltip
            defaultIndex={0}
            active={loading ? false : undefined}
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Bar
            dataKey="booking"
            fill={loading ? "var(--skeleton)" : "var(--color-booking)"}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
            className={
              loading ? "animate-pulse motion-reduce:animate-none" : undefined
            }
          />
          <Bar
            dataKey="pos"
            fill={loading ? "var(--skeleton)" : "var(--color-pos)"}
            fillOpacity={loading ? 0.6 : 1}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
            className={
              loading ? "animate-pulse motion-reduce:animate-none" : undefined
            }
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default Chart;

const Legend = ({ color, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <span className={`size-2 shrink-0 rounded-full ${color}`} />
    {children}
  </span>
);

const CollectionsAxisSkeleton = ({ x = 0, y = 0, axis }) => (
  <rect
    x={axis === "y" ? x - 24 : x - 12}
    y={y - 4}
    width={24}
    height={8}
    rx={3}
    fill="var(--skeleton)"
    className="animate-pulse motion-reduce:animate-none"
  />
);
