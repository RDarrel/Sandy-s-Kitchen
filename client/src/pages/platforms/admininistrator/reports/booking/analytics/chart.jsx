import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { compactMoney, money } from "./data";

const chartConfig = {
  bookings: { label: "Bookings", color: "var(--primary)" },
  value: { label: "Booking value", color: "var(--chart-3)" },
};

const BookingChart = ({ data, metric }) => {
  const isValue = metric === "value";

  return (
    <div className="min-w-0 w-full px-5 pb-3">
      <div className="mb-4 flex h-[18px] items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground">
          {isValue ? "Amount (PHP)" : "Number of bookings"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={`size-2 shrink-0 rounded-full ${isValue ? "bg-chart-3" : "bg-primary"}`}
            aria-hidden="true"
          />
          {chartConfig[metric].label}
        </span>
      </div>
      <ChartContainer
        config={chartConfig}
        className="h-[240px] w-full aspect-auto sm:h-[260px]"
        aria-label={`${chartConfig[metric].label} over the selected period`}
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 10, right: 5, left: -12, bottom: 0 }}
          barGap={4}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="month"
            height={30}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            minTickGap={15}
            fontSize={11}
          />
          <YAxis
            width={60}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            domain={[0, "auto"]}
            allowDecimals={false}
            tickFormatter={isValue ? compactMoney : undefined}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel ?? label}
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span
                        className={`size-2.5 rounded-[2px] ${isValue ? "bg-chart-3" : "bg-primary"}`}
                        aria-hidden="true"
                      />
                      {chartConfig[metric].label}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {isValue ? money(value) : value.toLocaleString()}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey={metric}
            fill={`var(--color-${metric})`}
            radius={[4, 4, 0, 0]}
            maxBarSize={44}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default BookingChart;
