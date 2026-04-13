import React, { useEffect } from "react";
import { Calendar, ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/assets/fuels";
import { Skeleton } from "@/components/ui/skeleton";

const colorMap = {
  Premium: "#FF0000",
  Unleaded: "#008000",
  Diesel: "#C7BD00",
};

const FuelPrice = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { collections, isLoading } = useSelector(({ fuels }) => fuels);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [dispatch, token]);

  const getBadge = (fuel) => {
    switch (fuel) {
      case "Premium":
        return (
          <Badge className={"bg-[#FFD1D1] w-15 h-5 mt-1 -ml-[30px]"}>
            <TrendingUp className="text-[#C91111] mr-1" />
            <span className="text-[#C91111] ">8%</span>
          </Badge>
        );
      case "Diesel":
        return (
          <Badge
            className={
              "bg-[#C2FFC2] border border-[rgba(0, 91, 0, 0.08)] w-15 h-5 mt-1 -ml-[30px]"
            }
          >
            <TrendingDown className="text-[#005B00] mr-1" />
            <span className="text-[#005B00] ">10%</span>
          </Badge>
        );
      default:
        return (
          <Badge
            className={
              "bg-[#C2FFC2] border border-[rgba(0, 91, 0, 0.08)] w-15 h-5 mt-1 -ml-[30px]"
            }
          >
            <TrendingDown className="text-[#005B00] mr-1" />
            <span className="text-[#005B00] ">5%</span>
          </Badge>
        );
    }
  };
  return (
    <Card className="col-span-1 p-0">
      <CardContent className="grid grid-cols-1 gap-1">
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-1xl">Fuel Price</h2>
            <h2 className="text-[12px] -mt-[4px] text-[#FF4F00]">
              Daily Fuel Roll
            </h2>
          </div>
          <Button className=" bg-[#F5F2ED] border border-[#DDD] h-[25px] hover:bg-[#EAE6D7] ">
            <Calendar className="text-[#696969]" />{" "}
            <span className="text-[#696969]">Today</span>
          </Button>
        </div>
        {!isLoading ? (
          collections.map((fuel) => {
            const { pricing, name } = fuel;
            const srp = pricing.cost + pricing.markup;
            return (
              <Card className={"p-2 mt-1"}>
                <CardContent className={"m-0 p-0"}>
                  <h2
                    className={` font-[700] `}
                    style={{ color: colorMap[name] }}
                  >
                    {name}
                  </h2>
                  <div className="text-end w-full">
                    <h2 className="digital-texts text-2xl text-black-700 mx-auto">
                      P{srp.toFixed(2)} L
                    </h2>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <>
            {new Array(3).fill("").map((_, i) => (
              <div key={i}>
                <Card className={" mt-1 h-19 p-2"}>
                  <CardContent className={"m-0 p-0"}>
                    <Skeleton className="w-25 h-6 " />
                    <div className=" flex justify-end mt-2">
                      <Skeleton className="w-40 h-7 " />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FuelPrice;
