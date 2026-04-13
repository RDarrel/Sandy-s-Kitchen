import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
const warning = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 22 20"
    fill="none"
  >
    <path
      d="M8.20065 1.5C9.35536 -0.500002 12.2421 -0.499998 13.3968 1.5L21.191 15C22.3457 17 20.9024 19.5 18.593 19.5H3.00446C0.69507 19.5 -0.7483 17 0.4064 15L8.20065 1.5Z"
      fill="#FF3B30"
    />
    <path
      opacity="0.5"
      d="M11.6563 4.36328L11.4347 12.511H9.35518L9.12793 4.36328H11.6563ZM10.395 16.1474C10.02 16.1474 9.69798 16.0148 9.42908 15.7496C9.16013 15.4807 9.02753 15.1587 9.03133 14.7837C9.02753 14.4125 9.16013 14.0943 9.42908 13.8292C9.69798 13.564 10.02 13.4314 10.395 13.4314C10.7548 13.4314 11.0711 13.564 11.3438 13.8292C11.6166 14.0943 11.7548 14.4125 11.7586 14.7837C11.7548 15.0337 11.6885 15.2629 11.5597 15.4712C11.4347 15.6758 11.27 15.8405 11.0654 15.9655C10.8609 16.0867 10.6374 16.1474 10.395 16.1474Z"
      fill="white"
    />
  </svg>
);
export default function FuelStockBar({
  fuelType = "Diesel",
  currentStock = 0, // liters
  maxStock = 5000, // liters
  color = "",
  segments = 10,
  svg,
  colors = [],
  isAdmin = false,
  isLoading = false,
  isWarning = false,
}) {
  const [fillSegments, setFillSegments] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = Math.round((currentStock / maxStock) * segments);
    const interval = setInterval(() => {
      current++;
      if (current > target) clearInterval(interval);
      else setFillSegments(current);
    }, 50);
    return () => clearInterval(interval);
  }, [currentStock, maxStock, segments]);

  const isLowStock = currentStock < 1000 && !isWarning;
  return (
    <div
      className={cn(
        "flex w-full items-center gap-6 p-6 border rounded-xl bg-white transition-all",
        !isAdmin && "max-w-lg",
        isLowStock && !isLoading && "warning-glow"
      )}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-full bg-[#F5F2ED] p-2 shadow-md"
        style={{ border: "3px solid #FFFFFF" }}
      >
        {isLowStock && !isLoading ? warning : svg}
      </div>

      {/* Info & Bar */}
      <div className="flex flex-col flex-1">
        {/* Fuel Type Label */}
        <div style={{ color }} className="font-bold text-xl mb-5 -mt-3">
          {fuelType}
        </div>

        {/* Progress Bar with segments */}
        <div className="relative flex items-center gap-0 h-3 shadow-inner border-2 border-black">
          {/* Segments */}
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-full transition-colors duration-500 "
              style={{
                backgroundColor: i < fillSegments ? colors[i] : "#e0e6e9",
                borderRight: i === segments - 1 ? "none" : "2px solid black",
              }}
            />
          ))}

          {/* Low Indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-45px",
              zIndex: 2,
              width: "30%",
              textAlign: "center",
            }}
          >
            {/* Arrow Up */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "8px solid black",
                marginLeft: "50%",
              }}
            />

            {/* Horizontal top line with left and right ticks */}
            <div
              style={{
                borderTop: "2px solid black",
                height: "1px",
                position: "relative",
              }}
            >
              {/* Left vertical tick */}
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  top: "0",
                  height: "8px",
                  borderLeft: "2px solid black",
                }}
              />

              {/* Right vertical tick */}
              <div
                style={{
                  position: "absolute",
                  right: "0",
                  top: "0",
                  height: "8px",
                  borderLeft: "2px solid black",
                }}
              />
            </div>

            {/* Label below */}
            <div className="text-md font-[500] text-[#C8C8C8] ">
              Low <span className=" text-red-700 font-[700] ml-1">1,000L</span>
            </div>
          </div>

          {/* Full Indicator */}
          <div
            style={{
              position: "absolute",
              right: "0%",
              top: "-50px", // nasa taas yung container
              zIndex: 2,
              width: "30%",
              textAlign: "center",
            }}
          >
            {/* Label above */}
            <div className="text-md font-bold  text-[#035903]">
              Full
              <span className=" text-red-700 font-[700] ml-1">5,000L</span>
            </div>

            {/* Horizontal top line with left and right ticks */}
            <div
              style={{
                borderBottom: "2px solid black", // line sa taas ng arrow
                height: "1px",
                position: "relative",
              }}
            >
              {/* Left vertical tick */}
              <div
                style={{
                  position: "absolute",
                  left: "0",
                  bottom: "0",
                  height: "8px",
                  borderLeft: "2px solid black",
                }}
              />

              {/* Right vertical tick */}
              <div
                style={{
                  position: "absolute",
                  right: "0",
                  bottom: "0",
                  height: "8px",
                  borderLeft: "2px solid black",
                }}
              />
            </div>

            {/* Arrow Down */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "8px solid black", // arrow pointing down
                marginLeft: "85%",
              }}
            />
          </div>
        </div>

        {/* Current Stock Text */}
        <div className="mt-4 text-right font-[600] text-[#C8C8C8]  ">
          Current Stock:
          <span className="text-black font-[700] ml-2">
            {Number.isInteger(Number(currentStock))
              ? Number(currentStock).toLocaleString() + "L"
              : Number(Number(currentStock).toFixed(2)).toLocaleString() + "L"}
          </span>
        </div>
      </div>
    </div>
  );
}
