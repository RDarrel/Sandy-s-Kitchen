import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Formatter } from "@/services/utilities";

const chartConfig = {
  booking: { label: "Booking", color: "var(--primary)" },
  pos: { label: "POS", color: "var(--chart-3)" },
};

const Donut = ({ revenueFrequency, channelData, totalRevenue }) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto h-[260px] w-full max-w-[300px] aspect-auto"
      aria-label="Collections distribution between Booking and POS"
    >
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <Pie
          key={revenueFrequency}
          data={channelData}
          dataKey="value"
          nameKey="name"
          innerRadius="61%"
          outerRadius="88%"
          startAngle={90}
          endAngle={-270}
          stroke="var(--card)"
          strokeWidth={3}
          isAnimationActive
          animationBegin={100}
          animationDuration={1400}
          animationEasing="ease-out"
        >
          {channelData.map((entry) => (
            <Cell
              key={entry.name}
              fill={
                entry.name === "booking"
                  ? "var(--color-booking)"
                  : "var(--color-pos)"
              }
            />
          ))}
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox)) return null;
              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                  <tspan
                    x={viewBox.cx}
                    dy="-3"
                    fill="var(--foreground)"
                    className="text-lg font-semibold tabular-nums"
                  >
                    {Formatter.amount(totalRevenue)}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    dy="22"
                    fill="var(--muted-foreground)"
                    className="text-xs"
                  >
                    Net Collections
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

export default Donut;
