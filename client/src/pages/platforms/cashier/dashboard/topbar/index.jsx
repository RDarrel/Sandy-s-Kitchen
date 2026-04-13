import React from "react";
import logo from "../../../../../assets/logo.png";
import { Profile } from "./profile";
import { HandCoins, MonitorCog } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { SetActiveTab } from "@/services/redux/slices/pos";

// Animated topbar using pure Tailwind only
const Topbar = () => {
  const { activeTab } = useSelector(({ pos }) => pos);
  const dispatch = useDispatch();

  const tabs = [
    { id: "POS", label: "POS", icon: <MonitorCog /> },
    { id: "DEALS", label: "SALES", icon: <HandCoins /> },
  ];

  return (
    <div className="flex justify-center px-10 ">
      <div
        className="bg-white h-15 px-3 rounded-xl shadow-md border border-[#FF4F00] flex items-center justify-between"
        style={{
          position: "absolute",
          width: "calc(100% - 3rem * 2)",
          top: "15px",
        }}
      >
        <div>
          <img src={logo} className="h-12 mt-1" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-10 relative">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => dispatch(SetActiveTab(tab.id))}
              className="flex flex-col items-center cursor-pointer select-none group"
            >
              <div className="flex gap-2 items-center transition-colors duration-300">
                {React.cloneElement(tab.icon, {
                  className: `transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-[#FF4F00] scale-110"
                      : "text-gray-600"
                  }`,
                })}
                <h2
                  className={`font-[700] transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-[#FF4F00] scale-105"
                      : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </h2>
              </div>

              {/* Underline animation using Tailwind width transition */}
              <div
                className={`h-[3px] rounded-full bg-[#FF4F00] transition-all duration-300 mt-1 ${
                  activeTab === tab.id ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              ></div>
            </div>
          ))}
        </div>

        <Profile />
      </div>
    </div>
  );
};

export default Topbar;
