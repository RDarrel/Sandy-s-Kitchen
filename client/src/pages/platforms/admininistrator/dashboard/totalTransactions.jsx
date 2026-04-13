import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LabelList, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDispatch, useSelector } from "react-redux";
import { TRANSACTIONS } from "@/services/redux/slices/dashboard";
import Percentage from "./percentage";
import { Skeleton } from "@/components/ui/skeleton";
import MonthSelect from "./date";
import formattedDate from "./formattedDate";

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
const TotalTransactions = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { transactions = [], isLoadingTransact } = useSelector(
    ({ dashboard }) => dashboard
  );
  const [month, setMonth] = useState({
    label: "This Month",
    value: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}`,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(TRANSACTIONS({ token, params: { month: month.value } }));
  }, [token, dispatch, month]);

  return (
    <Card className="border border-[#FF4F00]   ">
      <CardContent className={"h-full grid grid-cols-2 gap-0 "}>
        <div className="col-span-2 h-full -mb-5 mt-2">
          <div className="h-full grid grid-cols-2">
            <div className="h-full flex flex-col justify-end ">
              <h2 className="font-bold text-2xl">Total</h2>
              <h2 className="font-bold -mt-[8px] text-2xl">Transactions</h2>
              <div className="text-sm text-gray-500">
                {formattedDate(month.value)}
              </div>
            </div>
            <div className="h-full flex justify-end">
              <MonthSelect month={month} setMonth={setMonth} />
            </div>
          </div>
        </div>

        <div className="h-full flex items-center justify-center  ">
          <div>
            {!isLoadingTransact ? (
              <h2 className="text-5xl font-bold text-[#FF4F00]">
                +{transactions[0]?.total || 0}
              </h2>
            ) : (
              <Skeleton className="w-25 h-18 bg-gray-200 " />
            )}
          </div>
        </div>

        <div className="flex-grow mt-2 h-[11rem] ">
          {!isLoadingTransact ? (
            <ChartContainer config={chartConfig} className={"h-full w-full"}>
              <BarChart accessibilityLayer data={transactions}>
                <Bar
                  dataKey="total"
                  stackId="a"
                  barSize={70}
                  fill="#FF4F00"
                  radius={[10, 10, 10, 10]}
                >
                  {transactions.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#FF4F00" : "#FFF0D6"}
                    />
                  ))}
                  {transactions.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#FF4F00" : "#FFF0D6"}
                    />
                  ))}
                  <LabelList
                    dataKey="title"
                    content={({ x, y, width, index, value }) => (
                      <text
                        x={x + width / 2}
                        y={y + 12} // Adjusted to always appear visibly above the bar
                        fill={index % 2 === 0 ? "#FFFFFF" : "#FF4F00"}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={500}
                      >
                        {value}
                      </text>
                    )}
                  />

                  <LabelList
                    dataKey="total"
                    content={({ x, y, width, height, index, value }) => (
                      <text
                        x={x + width / 2}
                        y={y + height - 8}
                        fill={index % 2 === 0 ? "#FFFFFF" : "#FF4F00"}
                        textAnchor="middle"
                        fontSize={14}
                        fontWeight={500}
                      >
                        +{value}
                      </text>
                    )}
                  />
                </Bar>
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={false}
                  defaultIndex={1}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="relative h-full flex items-end  gap-2">
              <Skeleton className="w-18 h-40 bg-gray-200" />
              <Skeleton className="w-18 h-20 bg-gray-200" />
            </div>
          )}
        </div>
        <div className="flex col-span-2  m-0 p-0  -mb-3  ">
          <Percentage
            isLoading={isLoadingTransact}
            thisMonth={transactions[0]?.total}
            lastMonth={transactions[1]?.total}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalTransactions;
