import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDispatch, useSelector } from "react-redux";
import { TOP_PRODUCTS } from "@/services/redux/slices/dashboard";
import Percentage from "./percentage";
import { Skeleton } from "@/components/ui/skeleton";
import MonthSelect from "./date";
import formattedDate from "./formattedDate";

const TopProduct = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { top, isLoadingTop } = useSelector(({ dashboard }) => dashboard);
  const [month, setMonth] = useState({
    label: "This Month",
    value: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1,
    ).padStart(2, "0")}`,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(TOP_PRODUCTS({ token, params: { month: month.value } }));
  }, [token, dispatch, month]);

  const { products: chartDataPie = [], lastMonthTotalLiters = 0 } = top || {};

  const renderBadgeLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    name,
    fill,
    liters,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const isDiesel = name === "Premium";
    return (
      <foreignObject
        x={x - 60}
        y={y - 12}
        width={100}
        height={24}
        style={{
          overflow: "hide",
          zIndex: 999,
          position: "absolute", // Allow the label to be placed outside the SVG
        }}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            backgroundColor: fill, // ✅ match the pie color
            color: "#000", // or white if fill is dark
            boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.25)",
            borderRadius: "9999px",
            fontSize: "10px",
            padding: "2px 8px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <span className={`font-bold ${isDiesel && "text-white"}`}>
            {name}{" "}
            <span className={isDiesel ? "text-white" : "text-red-700"}>
              {Number(liters).toFixed(2)} L
            </span>
          </span>
        </div>
      </foreignObject>
    );
  };

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  };

  const sorted = [...chartDataPie].sort((a, b) => b.liters - a.liters);
  const top1Product = sorted[0] || {};
  const currentLiters = chartDataPie.reduce(
    (total, product) => total + product?.liters,
    0,
  );

  return (
    <Card className="border border-[#FF4F00]">
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Top Product</h2>
            <div className="text-sm text-gray-500">
              {formattedDate(month.value)}
            </div>
          </div>
          <MonthSelect month={month} setMonth={setMonth} />
        </div>
        {!isLoadingTop ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-square max-h-[230px] w-full  "
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartDataPie}
                dataKey="liters"
                nameKey="fuel"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                strokeWidth={5}
                paddingAngle={5}
                cornerRadius={10}
                label={renderBadgeLabel}
                labelLine={false}
              >
                {chartDataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <text
                x="50%" // Horizontal center
                y="50%" // Vertical center
                textAnchor="middle" // Centers the text horizontally
                dominantBaseline="middle" // Centers the text vertically
                className="text-[1.2rem] font-bold"
              >
                {Number(top1Product?.liters || 0).toFixed(2)}L
              </text>
              <text
                x="50%" // Horizontal center
                y="58%" // Vertical center
                textAnchor="middle" // Centers the text horizontally
                dominantBaseline="middle" // Centers the text vertically
                className="font-bold "
                fill="red"
              >
                {top1Product?.fuel}
              </text>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center mb-4">
            <Skeleton className="h-[222px] w-[222px] rounded-full " />
          </div>
        )}

        <Percentage
          thisMonth={currentLiters}
          lastMonth={lastMonthTotalLiters}
          isLoading={isLoadingTop}
        />
      </CardContent>
    </Card>
  );
};

export default TopProduct;
