import React, { useEffect, useState } from "react";
import FuelType from "./fuelType";
import Numpad from "./numpad";
import { useDispatch, useSelector } from "react-redux";
import { SetFUEL, SetSALE } from "@/services/redux/slices/pos";
import RollingNumber from "@/components/shared/rollingNumber";
import { Skeleton } from "@/components/ui/skeleton";
const fuelStyle = {
  Unleaded: {
    bg: "#00FF37",
    color: "black",
  },
  Diesel: {
    bg: "#FFD400",
  },
  Premium: {
    bg: "#F00",
    color: "white",
  },
};
const Machine = () => {
  const {
      sale: amount,
      fuel,
      fuels,
      fuelLoading = false,
      soldLiters = 0,
    } = useSelector(({ pos }) => pos),
    dispatch = useDispatch();

  const setAmount = (value) => dispatch(SetSALE(value));

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "s") {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        e.preventDefault();
        return;
      }

      const isTyping =
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable;

      if (key !== "c" && isTyping) return;

      // Backspace logic
      if (key === "backspace") {
        e.preventDefault();
        const newValue = String(amount).slice(0, -1);
        const _amount = newValue.length ? newValue : "0";
        setAmount(_amount);
        return;
      }

      if (key === "c") {
        const input = document.getElementById("cash");
        if (input) {
          input.focus();
          e.preventDefault();
        }
        return;
      }

      const targetElement = document.getElementById(`machine-${key}`);
      if (targetElement) {
        targetElement.click();
        targetElement.classList.add("bg-[#FFDA99]");
        setTimeout(() => {
          targetElement.classList.remove("bg-[#FFDA99]");
        }, 200);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [amount]);

  const displayAmount = () => {
    if (String(amount).endsWith(".")) {
      return amount;
    }
    if (!Number(amount)) return "0.00";
    return Number(amount).toLocaleString();
  };

  return (
    <div className="bg-[#646466] rounded-3xl w-[50rem]">
      <Curve />
      <div className="flex justify-between mx-5">
        <Dot />
        <Dot />
      </div>
      <div className="flex items-center justify-between">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="21"
          height="280"
          viewBox="0 0 21 387"
          fill="none"
        >
          <path
            d="M0 0.705566C11.3674 0.705566 20.5826 9.98944 20.5826 21.4401V365.287C20.5826 376.738 11.3674 386.022 0 386.022V0.705566Z"
            fill="#4B4B4A"
          />
        </svg>
        <div
          className="rounded-xl flex items-center justify-around"
          style={{
            width: "85%",
            height: "25rem",
            border: " 10px solid #585858",
          }}
        >
          <div className="grid grid-cols-1 gap-5">
            <div className="flex justify-between items-center -mt-1 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <g filter="url(#filter0_d_537_19135)">
                  <circle cx="9" cy="5" r="5" fill="#00FF00" />
                  <circle
                    cx="9"
                    cy="5"
                    r="4.5"
                    stroke="#404040"
                    stroke-opacity="0.67"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_d_537_19135"
                    x="0"
                    y="0"
                    width="18"
                    height="18"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_537_19135"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_537_19135"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
              <div className="bg-[#585857] h-10 w-42 rounded-md border p-2 border-[#4A4A4A] flex items-center justify-between">
                <h2 className="digital-text text-[1.5rem]">SL</h2>
                <h2 className="digital-text text-[1.5rem]">
                  {Number.isInteger(soldLiters)
                    ? soldLiters
                    : soldLiters.toFixed(2)}
                </h2>
              </div>
            </div>
            <div className="flex justify-center">
              <div
                className="w-[300px] h-[198px] bg-[#90B2C3] rounded-[12px] grid grid-cols-2 gap-2 p-4"
                style={{
                  boxShadow: "0px 0px 5.2px 2px rgba(0, 0, 0, 0.25)",
                  border: "1px solid #747373",
                }}
              >
                {[
                  ["S", amount],
                  [
                    "L",
                    fuel?.srp ? Number(amount / fuel?.srp || 0).toFixed(2) : 0,
                  ],
                  ["P", fuel?.srp || 0],
                ].map(([label, value], idx) => (
                  <React.Fragment key={idx}>
                    <div className="text-start">
                      <h2 className="text-5xl digital-text">{label}</h2>
                    </div>
                    <div className="flex justify-end">
                      <RollingNumber value={value} />
                      {/* <h2 className="text-5xl digital-text">{value}</h2> */}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className=" flex items-center gap-5">
              {!fuelLoading ? (
                fuels?.map((fl, idx) => {
                  const { name, _id } = fl;
                  const { bg, color } = fuelStyle[name];
                  return (
                    <FuelType
                      key={idx}
                      bg={bg}
                      isNoStock={fl.stock <= 0}
                      color={color}
                      title={name}
                      isActive={fuel?._id === _id}
                      handleClick={() =>
                        dispatch(SetFUEL(fuel._id === _id ? {} : fl))
                      }
                    />
                  );
                })
              ) : (
                <>
                  {new Array(3).fill("").map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="h-[70px] w-[70px] rounded-full bg-gray-200"
                    />
                  ))}
                </>
              )}
            </div>
          </div>
          <div className="w-[263px] h-[360px] bg-[#414141] rounded-xl  p-4">
            <div
              className="h-[63px] bg-[#73745D] mb-4 rounded-sm flex justify-between items-center p-1"
              style={{
                boxShadow: "0px 0px 8.7px 2px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h2 className="digital-text text-5xl">S</h2>

              <div className="overflow-x-auto max-w-[200px] whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                <h2 className="digital-text text-5xl">{displayAmount()}</h2>
              </div>
            </div>

            <Numpad />
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="280"
          viewBox="0 0 19 387"
          fill="none"
        >
          <path
            d="M0.132812 21.4401C0.132812 9.98944 9.34866 0.705566 20.7154 0.705566V386.022C9.34866 386.022 0.132812 376.738 0.132812 365.287V21.4401Z"
            fill="#4B4B4A"
          />
        </svg>
      </div>
      <div className="flex justify-between mx-5">
        <Dot />
        <Dot />
      </div>
      <div className="flex items-center justify-around">
        {new Array(3).fill("").map((_, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            width="89"
            height="15"
            viewBox="0 0 89 21"
            fill="none"
          >
            <path
              d="M0.712891 21.0001C0.712891 9.5495 9.92874 0.265625 21.2955 0.265625H67.6063C78.973 0.265625 88.1888 9.5495 88.1888 21.0001H0.712891Z"
              fill="#4B4B4A"
            />
          </svg>
        ))}
      </div>
    </div>
  );
};

export default Machine;

const Dot = () => {
  return (
    <div
      className="bg-[#303030]  flex items-center justify-center"
      style={{ borderRadius: "50%", height: "25px" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="19"
        viewBox="0 0 25 25"
        fill="black"
      >
        <path
          d="M17.7113 6.59252C14.5868 3.00656 9.60465 2.26524 6.58339 4.93672C3.56213 7.60821 3.64582 12.6809 6.77032 16.2668C9.89483 19.8528 14.877 20.5941 17.8982 17.9226C20.9195 15.2511 20.8358 10.1785 17.7113 6.59252Z"
          fill="#C6C4C1"
        />
      </svg>
    </div>
  );
};

const Curve = () => {
  return (
    <div className="flex justify-around">
      {new Array(3).fill("").map((_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="15"
          viewBox="0 0 89 21"
          fill="none"
        >
          <path
            d="M0.712891 0H88.1888C88.1888 11.4514 78.973 20.7345 67.6063 20.7345H21.2955C9.92874 20.7345 0.712891 11.4514 0.712891 0Z"
            fill="#4B4B4A"
          />
        </svg>
      ))}
    </div>
  );
};
