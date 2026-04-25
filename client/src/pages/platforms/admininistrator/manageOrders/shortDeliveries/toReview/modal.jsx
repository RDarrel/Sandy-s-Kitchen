import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { Label } from "@/components/ui/label";

import { CalendarIcon, Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { formattedAmount, formattedDate, fullName } from "@/services/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UPDATE, RESET } from "@/services/redux/slices/procurement/purchases";
import { cn } from "@/lib/utils";

const CustomModal = ({ isOpen, setIsOpen, selected }) => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    [isRefund, setIsRefund] = useState(false),
    [form, setForm] = useState({ supplier: "", liters: "" }),
    [date, setDate] = useState(() => {
      const today = new Date();
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 7); // Add 7 days to the current date

      return {
        from: today,
        to: toDate,
      };
    }),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const { liters } = selected;
      setForm({ liters: liters?.request });
      setIsRefund(false);
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success(
        `Purchase has been ${
          isRefund ? "refunded" : "re-delivered"
        } successfully!`,
      );
      setIsRefund(false);
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, isRefund, dispatch]);

  const { fuel, liters } = selected || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const { liters } = form;
    const { from = "", to = "" } = date;
    const { _id } = selected;
    const purchase = {
      _id,
      liters: { ...selected?.liters, incoming: liters },
      expectedDelivery: {
        from: formattedDate(from),
        to: formattedDate(to),
      },
      status: "incoming",
    };

    dispatch(
      UPDATE({
        token,
        data: {
          purchase,
          performBy: auth?._id,
          auditType: "redelivery",
          role: "administrator",
          fuelName: fuel?.name,
          ltrs: liters,
          supplierName: selected?.supplier?.name,
        },
      }),
    );
  };

  const handleDeny = () => {
    setIsRefund(true);
    dispatch(
      UPDATE({
        token,
        data: {
          purchase: { _id: selected._id, status: "refunded" },
          performBy: auth?._id,
          auditType: "refunded",
          role: "administrator",
          fuelName: fuel?.name,
          ltrs: liters?.request,
          amt: `₱${Number(
            form.liters * fuel?.pricing?.cost,
          )?.toLocaleString()}`,
          supplierName: selected?.supplier?.name,
        },
      }),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[26.8rem]  ">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Short Delivery</DialogTitle>
          <DialogDescription className="flex justify-between">
            Received By: {fullName(selected?.request?.by?.fullName)}{" "}
            <h2>@ May 18 2025</h2>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  type="text"
                  value={selected?.supplier?.name}
                  required
                  readOnly
                  onChange={({ target }) => {
                    setForm({
                      ...form,
                      liters: Number(target.value),
                    });
                  }}
                  id="supplier"
                  placeholder="Enter receive liters here.."
                />
              </div>
              <div className="grid items-center gap-1.5">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <div className="flex items-center gap-5 ">
                  <Input
                    type="text"
                    readOnly
                    className={
                      "bg-[#FFDFDF]  border border-[#A20000] !text-[16px] font-[600] !text-[#A20000]"
                    }
                    required
                    value={fuel?.name}
                    id="fuelType"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="orderLiters">Order Liters</Label>
                <Input
                  type="text"
                  value={`${liters?.order?.toLocaleString()}L`}
                  required
                  readOnly
                  onChange={({ target }) => {
                    setForm({
                      ...form,
                      liters: Number(target.value),
                    });
                  }}
                  id="orderLiters"
                  placeholder="Enter receive liters here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="receiveLiters">Received Liters</Label>
                <Input
                  type="text"
                  value={`${liters?.firstDelivery?.toLocaleString()}L`}
                  required
                  readOnly
                  onChange={({ target }) => {
                    setForm({
                      ...form,
                      liters: Number(target.value),
                    });
                  }}
                  id="receiveLiters"
                  placeholder="Enter receive liters here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="receiveLiters">Remaining Liters</Label>
                <Input
                  type="text"
                  value={`${liters?.request?.toLocaleString()}L`}
                  required
                  readOnly
                  onChange={({ target }) => {
                    setForm({
                      ...form,
                      liters: Number(target.value),
                    });
                  }}
                  id="receiveLiters"
                  placeholder="Enter receive liters here.."
                />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="grid w-30 items-center gap-1.5">
                <Label htmlFor="Amount for Received Liters">
                  Price Per Liter
                </Label>
                <Input
                  type="text"
                  id="Amount for Received Liters"
                  readOnly
                  value={`₱${formattedAmount(fuel?.pricing?.cost)}`}
                  placeholder="Enter receive liters here.."
                />
              </div>
              <div className="grid w-60 items-center gap-1.5">
                <Label htmlFor="Amount for Received Liters">
                  Remaining Balance
                </Label>
                <Input
                  type="text"
                  id="Amount for Received Liters"
                  readOnly
                  value={`₱${form.liters * fuel?.pricing?.cost}`}
                  placeholder="Enter receive liters here.."
                />
              </div>
            </div>
            <div className={cn("grid gap-2 w-full ", "className")}>
              <h2 className=" font-[500] text-[15px]">
                Expected Delivery Date:
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      " justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date?.to ? (
                        <>
                          {formattedDate(date.from)} - {formattedDate(date.to)}
                        </>
                      ) : (
                        <>{formattedDate(date.from)}</>
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message-2">Remarks of stockman</Label>
              <Textarea
                value={selected?.request?.remarks}
                readOnly
                className={"h-50"}
                id="message-2"
              />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button
              type="button"
              onClick={handleDeny}
              disabled={formSubmitted}
              className="bg-[#FFFFFF] border border-[#D5D7DA] text-black transition-colors duration-200 cursor-pointer hover:bg-[#F0F0F0] hover:border-[#B0B3B8]"
            >
              Refund
              {formSubmitted && isRefund && (
                <Loader className=" animate-spin" />
              )}
            </Button>
            <Button
              type="submit"
              disabled={formSubmitted}
              className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
            >
              Re-Delivery{" "}
              {formSubmitted && !isRefund && (
                <Loader className=" animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
