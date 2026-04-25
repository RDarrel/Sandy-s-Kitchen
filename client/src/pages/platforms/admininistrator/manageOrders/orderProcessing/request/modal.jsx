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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { formattedAmount, formattedDate, fullName } from "@/services/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UPDATE, RESET } from "@/services/redux/slices/procurement/purchases";
import { cn } from "@/lib/utils";
import { SetCOLLECTIONS } from "@/services/redux/slices/assets/fuels";
const MAX_CAPACITY = 5000;
const CustomModal = ({ isOpen, setIsOpen, selected, readOnly = false }) => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    { collections: suppliers } = useSelector(({ suppliers }) => suppliers),
    { collections: fuels = [] } = useSelector(({ fuels }) => fuels),
    [showAlert, setShowAlert] = useState(false),
    [isDeny, setIsDeny] = useState(false),
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

  const _fuel = fuels.find((item) => item?._id === selected?.fuel?._id);
  const { incoming = 0, stock = 0 } = _fuel || {};
  const availableCapacity = Math.max(MAX_CAPACITY - incoming - stock, 0);

  useEffect(() => {
    if (isOpen) {
      const { liters } = selected;
      setForm({ liters: liters?.request });
      setIsDeny(false);
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success(`Purchase ${isDeny ? "denied" : "approved"} successfully!`);
      setIsDeny(false);
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, isDeny, dispatch]);

  const { fuel } = selected || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const { supplier, liters } = form;
    const { from = "", to = "" } = date;
    if (!supplier || !liters) {
      return toast.warning("Missing Information!", {
        description:
          "Please provide both the supplier and the number of liters. These fields are required.",
      });
    }
    const { _id } = selected;
    const purchase = {
      _id,
      liters: { ...selected?.liters, incoming: liters },
      supplier,
      expectedDelivery: {
        from: formattedDate(from),
        to: formattedDate(to),
      },
      status: "incoming",
    };

    if (liters > availableCapacity && !readOnly) {
      return setShowAlert(true);
    }

    dispatch(
      UPDATE({
        token,
        data: {
          purchase,
          auditType: "approvedReq",
          performBy: auth?._id,
          fuelName: fuel?.name,
          ltrs: form.liters,
          role: "administrator",
          supplierName: suppliers.find(({ _id }) => _id === supplier)?.name,
        },
      }),
    ).then((action) => {
      if (!readOnly) {
        const { payload } = ({} = action.payload || {});
        const { purchase = {} } = payload || {};
        const { liters = {} } = purchase;
        const _fuels = [...fuels];
        const index = _fuels.findIndex(
          ({ _id }) => _id === purchase?.fuel?._id,
        );
        const { incoming: cIncoming = 0 } = _fuels[index] || {};
        _fuels[index] = {
          ..._fuels[index],
          incoming: cIncoming + liters.incoming,
        };
        dispatch(SetCOLLECTIONS(_fuels));
      }
    });
  };

  const handleDeny = () => {
    setIsDeny(true);
    dispatch(
      UPDATE({
        token,
        data: { purchase: { _id: selected._id, status: "denied" } },
      }),
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[26.8rem]  ">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {!readOnly ? "Request Order" : "Received Order"}
            </DialogTitle>
            <DialogDescription>
              {!readOnly
                ? `Request By: ${fullName(selected?.request?.by?.fullName)}`
                : `Received By: ${fullName(selected?.received?.by?.fullName)}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-2">
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
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="receiveLiters">Request Liters</Label>
                  <Input
                    type="number"
                    value={form.liters}
                    required
                    min={1000}
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

              <div className="grid gap-2">
                <Label className="font-normal font-[600] text-[15px]">
                  Select Supplier:
                </Label>
                <Select
                  value={form.supplier ?? ""}
                  onValueChange={(value) =>
                    setForm({ ...form, supplier: value })
                  }
                  required={true}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Suppliers</SelectLabel>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier._id}
                          value={supplier._id}
                        >{`${supplier.name}`}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="Amount for Received Liters">Total Cost</Label>
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
                            {formattedDate(date.from)} -{" "}
                            {formattedDate(date.to)}
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
                <Label htmlFor="message-2">Remarks</Label>
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
                Deny
                {formSubmitted && isDeny && (
                  <Loader className=" animate-spin" />
                )}
              </Button>
              <Button
                type="submit"
                disabled={formSubmitted}
                className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
              >
                Approve{" "}
                {formSubmitted && !isDeny && (
                  <Loader className=" animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approval exceeds capacity</AlertDialogTitle>
            <AlertDialogDescription>
              The request you are about to approve will exceed the tank’s safe
              capacity.
              <br />
              <br />
              <strong>Current stock:</strong> {stock?.toLocaleString()} L <br />
              {incoming ? (
                <>
                  <strong>Incoming orders:</strong> {incoming?.toLocaleString()}{" "}
                  L <br />
                </>
              ) : (
                ""
              )}
              <strong>Available capacity:</strong>{" "}
              {availableCapacity?.toLocaleString()} L
              <br />
              <br />
              Please adjust the approval. The maximum liters you can approve now
              is <strong>{availableCapacity?.toLocaleString()} L</strong> to
              prevent overfilling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setForm({ ...form, liters: availableCapacity });
                setShowAlert(false);
              }}
            >
              Approve Max ({availableCapacity?.toLocaleString()} L)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomModal;
