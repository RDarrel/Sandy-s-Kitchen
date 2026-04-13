import React, { useEffect } from "react";
import "./index.css";

import Machine from "./machine";
import Topbar from "./topbar";
import Cart from "./cart";
import { useDispatch, useSelector } from "react-redux";
import { FUELS, SALES, SOLD_LITERS } from "@/services/redux/slices/pos";
import Sales from "./sales";

// Simple fade + slide animation using pure Tailwind
const FadeWrapper = ({ children, keyId }) => {
  return (
    <div key={keyId} className="opacity-0 translate-y-4 animate-fadeSlide">
      {children}
    </div>
  );
};

function Cashier() {
  const { token, auth } = useSelector(({ auth }) => auth),
    { activeTab } = useSelector(({ pos }) => pos),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(FUELS({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    if (auth?._id) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(new Date())
        .replace(/\//g, "-");

      dispatch(
        SOLD_LITERS({
          token,
          params: {
            cashier: auth._id,
            date: date,
          },
        })
      );

      dispatch(
        SALES({
          token,
          params: { from: date, to: date, cashier: auth?._id },
        })
      );
    }
  }, [dispatch, token, auth]);
  return (
    <div className="bg-[#F5F2ED] min-h-screen w-full">
      <Topbar />

      {activeTab === "POS" ? (
        <FadeWrapper keyId="posScreen ">
          <div className="flex gap-10 justify-center mt-28">
            <Machine />
            <Cart />
          </div>
        </FadeWrapper>
      ) : (
        <FadeWrapper keyId="salesScreen">
          <div className="flex gap-10 justify-center mt-28">
            <Sales />
          </div>
        </FadeWrapper>
      )}
    </div>
  );
}

export default Cashier;
