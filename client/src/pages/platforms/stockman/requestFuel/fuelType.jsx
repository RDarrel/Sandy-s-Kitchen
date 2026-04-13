import React from "react";
import { CardContent, Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalize } from "lodash";
import { Button } from "@/components/ui/button";
const FuelType = ({ fuel, handleOrder = () => {}, isLoading, color = "" }) => {
  const {
    name,
    pricing = {},
    stock = 0,
    incoming = 0,
    request = 0,
  } = fuel || {};

  const { cost = 0 } = pricing;
  const totalStock = stock + incoming + request;
  const isFUll = totalStock >= 5000;
  return (
    <div className="p-[1.5px] rounded-xl bg-[linear-gradient(to_bottom,_rgba(255,79,0,1)_0%,_rgba(255,79,0,0.2)_70%,_white_100%)]">
      <Card className="rounded-xl bg-white shadow-[0px_4px_14.7px_rgba(0,0,0,0.16)]">
        <CardHeader>
          {isLoading ? (
            <Skeleton className="h-7 w-[150px] bg-gray-200" />
          ) : (
            <div className="flex items-center justify-between">
              <h2 className="text-1xl font-[700]">Fuel Restock:</h2>
              <Button
                onClick={() => handleOrder(fuel)}
                disabled={isFUll}
                className={`bg-[#${
                  isFUll ? "FF4F00" : "f5f5f5"
                }] border border-[#999] text-${
                  isFUll ? "white" : "black"
                } cursor-pointer hover:bg-[#ddd] hover:border-[#666] hover:text-[#333] transition-all duration-200`}
              >
                {isFUll ? "Fully Stocked" : "Order Now"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
          <hr />
          <h2 style={{ color }} className="text-2xl font-[700] mb-1">
            {isLoading ? (
              <Skeleton className="h-7 w-[150px] bg-gray-200" />
            ) : (
              name
            )}
          </h2>
          {[{ title: "srp", value: cost }].map(({ title, value }, index) => (
            <Card
              className="rounded-xl p-0 m-0"
              key={index}
              style={{
                border: "2px solid rgba(106, 88, 0, 0.08)",
                boxShadow: "none", // cleaner than 0px 0px 0px 0px
              }}
            >
              <CardContent className="px-5 m-0">
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <h2 className="font-[700] opacity-50">
                      {isLoading ? (
                        <Skeleton className="h-5 w-[90px] bg-gray-300" />
                      ) : (
                        capitalize(title)
                      )}
                    </h2>
                    {isLoading ? (
                      <Skeleton className="h-5 w-[90px] bg-gray-300 w-16" />
                    ) : (
                      <Badge
                        className={
                          "bg-[#C2FFC2] border border-[rgba(0, 91, 0, 0.08)] w-16 flex items-center justify-between h-5  -ml-[30px]"
                        }
                      >
                        <TrendingDown className="text-[#005B00] mr-1 font-[700]" />
                        <span className="text-[#005B00] ">12%</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-end -mb-[3px] -mt-1 w-100 w-full">
                    {isLoading ? (
                      <Skeleton className="h-5 w-full max-w-[170px] bg-gray-300 h-9 my-4" />
                    ) : (
                      <h2
                        className="digital-texts text-[40px] "
                        title="click to change the capital"
                      >
                        P{value.toFixed(2)}L
                      </h2>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelType;
