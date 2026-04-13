import React from "react";
import FuelPump from "../../../../../assets/fuelPump.png";
import { TriangleAlert } from "lucide-react";

const FuelType = ({
  bg,
  title,
  color,
  handleClick = () => {},
  isActive = false,
  isNoStock = false,
}) => {
  return (
    <div
      onClick={isNoStock ? undefined : handleClick} // disable click if no stock
      className="flex flex-col items-center justify-center gap-1 cursor-pointer"
      style={{
        background: isActive || isNoStock ? "#8A918B" : bg,
        height: "70px",
        width: "70px",
        borderRadius: "50%",
        border: "4px solid #4C4C4C",
        boxShadow: isActive
          ? "inset 4px 4px 6px rgba(0,0,0,0.3), inset -4px -4px 6px rgba(255,255,255,0.05)"
          : "0px 0px 0.5px 6px rgba(0, 0, 0, 0.10)",
        transform: isActive ? "translateY(1px)" : "none",
        transition: "all 0.15s ease",
      }}
      title={
        isNoStock
          ? `No stock available for ${title}. Please inform admin or stockman first.`
          : title
      } // tooltip
    >
      <h2
        style={{
          fontWeight: "700",
          color: color,
          fontSize: "11px",
          transform: isActive && !isNoStock ? "translateY(1px)" : "none",
          transition: "transform 0.15s ease",
        }}
      >
        {title}
      </h2>
      {isNoStock ? (
        <TriangleAlert size={17} color="orange" className="-mb-2" />
      ) : (
        <img
          src={FuelPump}
          style={{
            transform: isActive ? "translateY(1px)" : "none",
            transition: "transform 0.15s ease",
          }}
        />
      )}
    </div>
  );
};

export default FuelType;
