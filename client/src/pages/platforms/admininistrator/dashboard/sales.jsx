import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDispatch, useSelector } from "react-redux";
import { SALES } from "@/services/redux/slices/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Percentage from "./percentage";
import DateSelect from "./date";
import formattedDate from "./formattedDate";

const chartConfig = {
  Premium: { label: "Premium", color: "#FF6A00" },
  Unleaded: { label: "Unleaded", color: "#FFD36B" },
  Diesel: { label: "Diesel", color: "#7CC77C" },
};

export default function Sales() {
  const { token } = useSelector(({ auth }) => auth);
  const { sales, isLoadingSales } = useSelector(({ dashboard }) => dashboard);
  const [month, setMonth] = useState({
    label: "This Month",
    value: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(SALES({ token, params: { month: month.value } }));
  }, [token, dispatch, month]);

  const { datas = [], lastMonthTotal = 0 } = sales || {};

  const transformedData = datas.map((item) => ({
    date: item.date,
    Premium: item.sales?.Premium || 0,
    Unleaded: item.sales?.Unleaded || 0,
    Diesel: item.sales?.Diesel || 0,
  }));

  const total = datas.reduce((acc, item) => acc + item?.total, 0);

  return (
    <Card className="border border-[#FF4F00] col-span-2 h-55">
      <CardContent className={" h-full"}>
        <div className="flex justify-between mb-1 ">
          <div>
            <h2 className="font-[700]">Total Sales</h2>
            <div className="text-sm text-gray-500">
              {formattedDate(month.value)}
            </div>
          </div>

          <DateSelect month={month} setMonth={setMonth} />
        </div>

        <div className="grid grid-cols-3 ">
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center  h-full">
              {!isLoadingSales ? (
                <h2 className="text-4xl font-bold text-[#FF4F00]">
                  P{total.toLocaleString()}
                </h2>
              ) : (
                <Skeleton className="w-40 h-10 bg-gray-200" />
              )}
            </div>
            <Percentage
              thisMonth={total}
              lastMonth={lastMonthTotal}
              isLoading={isLoadingSales}
            />
          </div>

          <div className="col-span-2">
            {!isLoadingSales ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-33 "
              >
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart
                    data={transformedData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradPremium"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FF6A00"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FF6A00"
                          stopOpacity={0.05}
                        />
                      </linearGradient>

                      <linearGradient
                        id="gradUnleaded"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FFD36B"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FFD36B"
                          stopOpacity={0.05}
                        />
                      </linearGradient>

                      <linearGradient
                        id="gradDiesel"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#7CC77C"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#7CC77C"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={20}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />

                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                          }}
                          indicator="dot"
                        />
                      }
                    />

                    <Area
                      dataKey="Premium"
                      type="natural"
                      fill="url(#gradPremium)"
                      stroke="#FF6A00"
                      stackId="a"
                    />
                    <Area
                      dataKey="Unleaded"
                      type="natural"
                      fill="url(#gradUnleaded)"
                      stroke="#FFD36B"
                      stackId="a"
                    />
                    <Area
                      dataKey="Diesel"
                      type="natural"
                      fill="url(#gradDiesel)"
                      stroke="#7CC77C"
                      stackId="a"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Skeleton className="w-full h-30 bg-gray-200" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
