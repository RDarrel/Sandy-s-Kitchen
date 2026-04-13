import React, { useState } from "react";
import { CardContent, Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader, TrendingDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { capitalize } from "lodash";
import { cn } from "@/lib/utils";

const MIN_MARKUP = 1; // Minimum markup in percent
const MAX_MARKUP = 50; // Maximum markup in percent

const FuelType = ({
  fuel,
  formSubmitted,
  selected,
  color = "",
  setSelected,
  handleSubmit,
  isLoading,
}) => {
  const [newSrp, setNewSrp] = useState(0);
  const [error, setError] = useState("");
  const { name, pricing = {} } = fuel || {};
  const { cost = 0, percentage = 0 } = pricing;

  const handleMarkupChange = (value, isMarkUp = false) => {
    setNewSrp(value);
    if (!isMarkUp) return setError("");
    if (value < MIN_MARKUP) setError(`Minimum markup is ${MIN_MARKUP}%`);
    else if (value > MAX_MARKUP) setError(`Maximum markup is ${MAX_MARKUP}%`);
    else setError("");
  };

  return (
    <div className="p-[1.5px] rounded-xl bg-[linear-gradient(to_bottom,_rgba(255,79,0,1)_0%,_rgba(255,79,0,0.2)_70%,_white_100%)]">
      <Card className="rounded-xl bg-white shadow-[0px_4px_14.7px_rgba(0,0,0,0.16)]">
        <CardHeader style={{ color }} className="text-2xl font-[700] ">
          {isLoading ? (
            <Skeleton className="h-7 w-[150px] bg-gray-200" />
          ) : (
            name
          )}
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3">
          {[
            { title: "cost", value: cost },
            { title: "markup", value: percentage, isMarkUp: true },
            {
              title: "srp",
              value: cost * (1 + percentage / 100),
              notEditable: true,
            },
          ].map(
            (
              { title, value, notEditable = false, isMarkUp = false },
              index
            ) => (
              <Card
                className="rounded-xl p-0 m-0"
                key={index}
                style={{
                  border: "2px solid rgba(106, 88, 0, 0.08)",
                  boxShadow: "none",
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
                        <Badge className="bg-[#C2FFC2] border border-[rgba(0, 91, 0, 0.08)] w-16 flex items-center justify-between h-5 -ml-[30px]">
                          <TrendingDown className="text-[#005B00] mr-1 font-[700]" />
                          <span className="text-[#005B00] ">12%</span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-end -mb-[3px] -mt-1 w-full">
                      {isLoading ? (
                        <Skeleton className="h-5 w-full max-w-[170px] bg-gray-300 h-9 my-4" />
                      ) : (
                        <>
                          {selected?.updatedKey === title &&
                          selected?.name === name &&
                          selected.id === index ? (
                            <div className="flex flex-col items-end w-full">
                              <div className="flex items-center">
                                <div className="relative">
                                  <Input
                                    className={cn(
                                      "my-3 w-32",
                                      isMarkUp && "pr-8"
                                    )}
                                    type="number"
                                    value={String(newSrp)}
                                    onChange={({ target }) =>
                                      handleMarkupChange(
                                        Number(target.value),
                                        isMarkUp
                                      )
                                    }
                                  />
                                  {isMarkUp && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                      %
                                    </span>
                                  )}
                                </div>

                                {formSubmitted ? (
                                  <Loader className="mx-2 animate-spin" />
                                ) : (
                                  <Check
                                    className={cn(
                                      "mx-2 cursor-pointer text-[#FF4F00]",
                                      error &&
                                        isMarkUp &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                    strokeWidth={4}
                                    onClick={() => {
                                      const markup = isMarkUp
                                        ? (newSrp * cost) / 100
                                        : (percentage * newSrp) / 100;

                                      if (!error) {
                                        handleSubmit(
                                          isMarkUp ? "percentage" : "cost",
                                          newSrp,
                                          fuel._id,
                                          markup,
                                          `Updated ${name} ${
                                            isMarkUp ? "markup" : "cost"
                                          } from ${
                                            isMarkUp
                                              ? `${percentage}%`
                                              : `₱${cost}`
                                          } to ${
                                            isMarkUp
                                              ? `${newSrp}%`
                                              : `₱${newSrp}`
                                          }`
                                        );
                                      }
                                    }}
                                    title={
                                      error && isMarkUp
                                        ? "Invalid markup value"
                                        : "Update"
                                    }
                                    disabled={!!error && isMarkUp} // disables button if error exists
                                  />
                                )}
                                <X
                                  strokeWidth={4}
                                  className="cursor-pointer"
                                  title="Cancel"
                                  disabled={formSubmitted}
                                  onClick={() => {
                                    setSelected({});
                                    setNewSrp(0);
                                    setError("");
                                  }}
                                />
                              </div>
                              {error && isMarkUp && (
                                <p className="text-sm text-red-700 text-500 -mt-2  mb-1">
                                  {error}
                                </p>
                              )}
                            </div>
                          ) : (
                            <h2
                              className="digital-texts text-[40px] cursor-pointer"
                              title="click to change the value"
                              onClick={() => {
                                if (notEditable) return;
                                setSelected({
                                  updatedKey: title,
                                  name,
                                  id: index,
                                });
                                setError("");
                                setNewSrp(value);
                              }}
                            >
                              {isMarkUp ? `${value}%` : `P${value.toFixed(2)}`}
                              {notEditable && "L"}
                            </h2>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelType;
