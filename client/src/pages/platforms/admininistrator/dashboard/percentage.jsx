import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Percentage = ({ thisMonth = 0, lastMonth = 0, isLoading = false }) => {
  // Ensure numbers
  const current = Number(thisMonth);
  const previous = Number(lastMonth);

  let percentChange = 0;
  let isIncrease = true;

  if (previous > 0) {
    percentChange = ((current - previous) / previous) * 100;
    isIncrease = percentChange >= 0;

    // Round to nearest integer
    percentChange = Math.round(Math.abs(percentChange));
    percentChange = percentChange > 100 ? 100 : percentChange;
  } else {
    // If last month is 0, default to 100%
    percentChange = 100;
    isIncrease = true;
  }

  return (
    <div
      className="flex items-center gap-3 mb-1"
      title={`Actual change: ${Math.round(
        ((current - previous) / (previous || 1)) * 100
      )}%`}
    >
      {!isLoading ? (
        <>
          {isIncrease ? (
            <ArrowUp className="text-[#00AC0E] font-[700]" />
          ) : (
            <ArrowDown className="text-[#F00] font-[700]" />
          )}
          <h2>
            <span
              className={`font-[700] ${
                isIncrease ? "text-[#00AC0E]" : "text-[#F00]"
              }`}
            >
              {percentChange}%
            </span>{" "}
            <span className="text-[#727272] font-[500]">VS last month</span>
          </h2>
        </>
      ) : (
        <Skeleton className="w-50 h-5 bg-gray-200 d-block -mb-1" />
      )}
    </div>
  );
};

export default Percentage;
