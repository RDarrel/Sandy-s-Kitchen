import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";

import Items from "./items";

import { SAVE, SetCART } from "@/services/redux/slices/pos";

import Spinner from "@/components/shared/spinner";

const Cart = () => {
  const { auth, token } = useSelector(({ auth }) => auth);
  const { cart, formSubmitted = false } = useSelector(({ pos }) => pos);
  const [cash, setCash] = useState(0);
  const dispatch = useDispatch();
  const getTotalAmount = () => {
    if (!cart.length) return 0;
    return cart.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedCart = cart.map((item) => {
      const { fuel, amount } = item;
      const { _id, srp, markup } = fuel;
      return {
        fuel: _id,
        fuelName: fuel?.name,
        markup,
        amount,
        srp,
        liters: amount / srp,
      };
    });
    const totalLiters = formattedCart.reduce(
      (acc, item) => acc + item.liters,
      0
    );
    const deal = {
      cashier: auth._id,
      cart: formattedCart,
      amount: Number(getTotalAmount() || 0),
      cash: Number(cash || 0),
      liters: totalLiters || 0,
    };
    dispatch(SAVE({ data: deal, token })).then(() => {
      setCash(0);
      dispatch(SetCART([]));
    });
  };

  return (
    <div>
      <Card className={"w-90"}>
        <CardHeader className={"text-2xl font-[700] -mt-5"}>
          Fuel Selection
        </CardHeader>
        <CardContent className={"p-[12px]"}>
          <form onSubmit={handleSubmit}>
            <Card className={"-mt-9 h-[23.5rem] p-1"}>
              <CardContent
                className="flex flex-col h-full p-2"
                style={{
                  fontFamily:
                    "Courier New, Courier, Consolas, Monaco, monospace",
                }}
              >
                <Items />
                <div className="mt-auto">
                  <div
                    style={{ border: "1px dashed black" }}
                    className="my-2"
                  ></div>
                  <div className="flex items-center justify-between">
                    <h2>Amount:</h2>
                    <h2>₱{Number(getTotalAmount() || 0).toFixed(2)}</h2>
                  </div>
                  <div
                    style={{ border: "1px dashed black" }}
                    className="my-2"
                  ></div>
                  <div className="flex items-center justify-between">
                    <h2>Cash:</h2>
                    <Input
                      min={getTotalAmount()}
                      placeholder="Enter cash here.."
                      id="cash"
                      value={String(cash)}
                      onChange={(e) => setCash(Number(e.target.value))}
                      required
                      type={"number"}
                      className="ml-5 h-[1.8rem] "
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="-mb-4">
              <Button
                className="w-full bg-[#EC682D]  hover:bg-[#d05e24]  cursor-pointer -mb-6  mt-3"
                disabled={cart.length === 0 || formSubmitted}
              >
                Complete Transaction <Spinner formSubmitted={formSubmitted} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cart;
