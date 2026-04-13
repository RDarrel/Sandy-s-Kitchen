import React, { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FuelStockBar from "./fuelType";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/assets/stocks";
import { cn } from "@/lib/utils";
const fuelStockColors = {
  Premium: [
    "#700000",
    "#820101",
    "#A00202",
    "#AD0000",
    "#AD0000",
    "#BB0000",
    "#CA0000",
    "#D60000",
    "#E80000",
    "#FF0000",
  ],
  Unleaded: [
    "#004B00",
    "#015E01",
    "#017E01",
    "#028D02",
    "#019D01",
    "#00AE00",
    "#00C200",
    "#02D402",
    "#00E400",
    "#00FF00",
  ],
  Diesel: [
    "#575700",
    "#6A6A00",
    "#7E7E00",
    "#909000",
    "#A4A400",
    "#B7B700",
    "#CBCB00",
    "#DDDD05",
    "#EBEB02",
    "#FFFF00",
  ],
};
export default function Dashboard({ isAdmin = false }) {
  const { token } = useSelector(({ auth }) => auth),
    { collections = [], isLoading } = useSelector(({ stocks }) => stocks),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [token, dispatch]);

  const getStocks = (fuelID) => {
    return (
      [...collections]?.find(({ fuel }) => fuel._id === fuelID)?.liters || 0
    );
  };
  return (
    <div className="flex flex-col justify-center items-center  w-full gap-5">
      {/* old width 180 not full */}
      <Card
        className={cn(
          "rounded-3xl", // always applied
          isAdmin ? "w-full" : "w-180"
        )}
      >
        <CardHeader className={"text-2xl font-[700]"}>
          Fuel Tank Levels
        </CardHeader>
        <CardContent
          className={"flex flex-col justify-center items-center  gap-5"}
        >
          {[
            {
              color: "#008000",
              type: "Unleaded",
              stock: getStocks("6823797e0a661261ac790756"),
            },
            {
              color: "#FF0000",
              type: "Premium",
              stock: getStocks("682378e40a661261ac790755"),
            },
            {
              color: "#C7BD00",
              type: "Diesel",
              stock: getStocks("6823798f0a661261ac790757"),
            },
          ]
            .sort((a, b) => a.stock - b.stock)
            .map(({ color, type, stock }, idx) => (
              <FuelStockBar
                key={idx}
                fuelType={type}
                isLoading={isLoading}
                color={color}
                currentStock={stock}
                colors={fuelStockColors[type]}
                isAdmin={isAdmin}
                svg={
                  <>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 40 40"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 30H22.6316M11.0526 17H21.5789M21.5789 30V12C21.5789 11.4696 21.3571 10.9609 20.9623 10.5858C20.5675 10.2107 20.032 10 19.4737 10H13.1579C12.5995 10 12.0641 10.2107 11.6692 10.5858C11.2744 10.9609 11.0526 11.4696 11.0526 12V30M21.5789 21H23.6842C24.2426 21 24.778 21.2107 25.1729 21.5858C25.5677 21.9609 25.7895 22.4696 25.7895 23V25C25.7895 25.5304 26.0113 26.0391 26.4061 26.4142C26.8009 26.7893 27.3364 27 27.8947 27C28.4531 27 28.9886 26.7893 29.3834 26.4142C29.7782 26.0391 30 25.5304 30 25V17.83C30.0002 17.5661 29.9455 17.3047 29.8389 17.061C29.7323 16.8173 29.576 16.5961 29.3789 16.41L25.7895 13"
                        stroke={color}
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </>
                }
              />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
