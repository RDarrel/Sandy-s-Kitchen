import { RESET_SALE, SetCART, SetSALE } from "@/services/redux/slices/pos";
import { CircleArrowRight, Delete, Forward, TriangleAlert } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Numpad = () => {
  const { sale: amount, fuel, cart = [] } = useSelector(({ pos }) => pos);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState({ title: "", desc: "" });
  const dispatch = useDispatch();
  const setAmount = (value) => dispatch(SetSALE(value));

  const handleProceed = () => {
    const { stock = 0, srp } = fuel;
    if (!amount || amount <= 0) {
      setMessage({
        title: "Missing Sale Amount",
        desc: "Please enter how much fuel the customer wants to purchase.",
      });
      setOpen(true);
      return;
    }

    if (!fuel?._id) {
      setMessage({
        title: "No Fuel Selected",
        desc: "Please select a fuel type before continuing.",
      });
      setOpen(true);
      return;
    }

    const buyLiters = amount / srp;
    if (buyLiters > stock) {
      setMessage({
        title: "Exceeds Maximum Allowed",
        desc: `You cannot sell more than the allowed maximum of <b>${stock.toFixed(
          2
        )} liters</b> for <b>${fuel.name}</b>.`,
      });
      setOpen(true);
      return;
    }

    const _cart = [...cart];
    _cart.unshift({ amount, fuel });
    dispatch(SetCART(_cart));
    dispatch(RESET_SALE());
  };
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="grid grid-cols-3 gap-2 col-span-9">
        {new Array(10).fill("").map((_, index) => {
          const number = index + 1 === 10 ? 0 : index + 1;
          return (
            <div
              key={index}
              id={`machine-${number}`}
              onClick={() =>
                setAmount(Number(amount) ? `${amount}${number}` : `${number}`)
              }
              className="cursor-pointer w-full h-[55px] bg-[#F5F2ED] rounded-[4px] flex justify-center items-center hover:bg-[#FFDA99]"
              style={{
                border: "2px solid #A8A3A3",
                fontSize: "32px",
                fontWeight: "700",
                lineHeight: "14px",
                boxShadow: "0px 0px 11.9px 4px #777 inset",
              }}
            >
              {number}
            </div>
          );
        })}

        <div
          id="machine-."
          onClick={() => {
            const _prev = String(amount);
            if (_prev.includes(".")) return amount;
            if (_prev === "" || _prev === "0") return 0;
            setAmount(`${_prev}.`);
          }}
          className="cursor-pointer w-full h-[55px] bg-[#F5F2ED] rounded-[4px] flex justify-center items-center"
          style={{
            border: "2px solid #A8A3A3",
            fontSize: "32px",
            fontWeight: "700",
            boxShadow: "0px 0px 11.9px 4px #777 inset",
          }}
        >
          <span className="mt-[-18px]"> .</span>
        </div>

        <div
          onClick={() => setAmount("0")}
          className="cursor-pointer h-[50px] flex bg-[#EC682D] rounded-[4px] flex width-[55px] h-[55px] p-2 justify-center items-center"
          style={{
            border: "2px solid black",
            fontSize: "18px",
            fontWeight: "700",
            lineHeight: "14px",
          }}
        >
          Clear
        </div>
      </div>

      <div className="col-span-3 grid grid-rows-4 gap-2">
        <div
          onClick={() => {
            const newValue = String(amount).slice(0, -1);
            const _amount = newValue.length ? newValue : "0";
            setAmount(_amount);
          }}
          className="cursor-pointer h-[55px] bg-[#EC682D] text-white rounded-[4px] flex justify-center items-center"
          style={{
            border: "2px solid black",
            fontSize: "18px",
            fontWeight: "700",
            lineHeight: "14px",
          }}
        >
          <Delete color="black" size={20} />
        </div>

        <div
          onClick={handleProceed}
          className="cursor-pointer bg-[orange] text-white rounded-[4px] flex flex-col justify-center items-center row-span-3 
             hover:bg-[#e69500] transition-colors duration-200"
          style={{
            border: "2px solid black",
            fontSize: "18px",
            fontWeight: "700",
          }}
        >
          <Forward strokeWidth={4} size={30} />
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <TriangleAlert className="mr-2" color="orange" />
              {message.title}
            </AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{ __html: message.desc }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Numpad;
