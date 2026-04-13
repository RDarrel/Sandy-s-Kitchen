import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDispatch, useSelector } from "react-redux";
import { LITERS } from "@/services/redux/slices/dashboard";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

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

// helper to get start/end of week
const getWeekRange = (offset = 0) => {
  const now = new Date();
  const currentDay = now.getDay();
  const diff = currentDay === 0 ? 6 : currentDay - 1;

  const start = new Date(now);
  start.setDate(now.getDate() - diff + offset * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const WeeklyAverage = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { liters: chartDataBar = [], isLoadingLiters } = useSelector(
    ({ dashboard }) => dashboard
  );
  const dispatch = useDispatch();

  const [week, setWeek] = useState({
    label: "This Week",
    value: getWeekRange(0),
  });

  useEffect(() => {
    dispatch(
      LITERS({
        token,
        params: {
          start: week.value.start.toISOString(),
          end: week.value.end.toISOString(),
        },
      })
    );
  }, [token, dispatch, week]);

  return (
    <Card>
      <CardContent className="h-full flex flex-col ">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Liter Sale</h2>
            <h2 className="text-[12px] -mt-[4px] text-[#FF4F00]">
              Weekly Average
            </h2>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#F5F2ED] border border-[#DDD] h-[30px] hover:bg-[#EAE6D7] flex items-center">
                <Calendar className="text-[#696969]" />
                <span className="text-[#696969]">
                  {week?.label || "Select"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[150px]">
              <DropdownMenuItem
                onClick={() =>
                  setWeek({ label: "This Week", value: getWeekRange(0) })
                }
              >
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setWeek({ label: "Last Week", value: getWeekRange(-1) })
                }
              >
                Last Week
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isLoadingLiters ? (
          <h2 className="font-bold text-[30px] text-[#FF4F00]">
            +{chartDataBar.reduce((a, b) => a + b.Liters, 0) || 0} L
          </h2>
        ) : (
          <Skeleton className="h-12 w-[150px] bg-gray-200 mt-2 " />
        )}

        {!isLoadingLiters ? (
          <div className="flex-grow">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                accessibilityLayer
                data={chartDataBar}
                width={undefined}
              >
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const weekday = new Date(value).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                      }
                    );
                    return weekday.charAt(0);
                  }}
                />
                <Bar
                  dataKey="Liters"
                  stackId="a"
                  barSize={10}
                  fill="#FF4F00"
                  radius={[10, 10, 10, 10]}
                />
                <ChartTooltip
                  content={(props) => {
                    const { payload } = props;
                    // payload is an array of bar/line info
                    if (
                      !payload ||
                      payload.length === 0 ||
                      payload[0].value === 0
                    )
                      return null;
                    return <ChartTooltipContent indicator="line" {...props} />;
                  }}
                  cursor={false}
                  defaultIndex={1}
                />
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex gap-4 h-full items-end">
            {new Array(7).fill(0).map((_, index) => {
              // Gumawa ng pattern ng heights
              const heights = [
                "h-[70%]",
                "h-[60%]",
                "h-[80%]",
                "h-[50%]",
                "h-[70%]",
                "h-[30%]",
                "h-[90%]",
              ];
              return (
                <Skeleton
                  key={index}
                  className={`w-full bg-gray-200 mt-2 ${
                    heights[index % heights.length]
                  }`}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyAverage;
