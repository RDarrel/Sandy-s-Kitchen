import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader, CalendarIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formattedAmount } from "@/services/utilities";
import { RESET, SAVE } from "@/services/redux/slices/procurement/purchases";
import machineLogo from "../../../../../assets/machineLogo.png";
import { capitalize } from "lodash";

// shadcn AlertDialog
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
import { SetCOLLECTIONS } from "@/services/redux/slices/assets/fuels";

const MAX_CAPACITY = 5000;
const MIN_REQUEST = 1000;

const Order = ({ isOpen, setIsOpen, selected }) => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { collections: fuels } = useSelector(({ fuels }) => fuels),
    { collections: suppliers } = useSelector(({ suppliers }) => suppliers),
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    [form, setForm] = useState({ supplier: "", liters: 1000 }),
    [showAlert, setShowAlert] = useState(false),
    [showMinAlert, setShowMinAlert] = useState(false),
    dispatch = useDispatch();

  const { pricing = {}, incoming = 0, stock = 0 } = selected;
  const { cost = 0 } = pricing || {};
  const totalStock = stock + incoming;
  const availableCapacity = Math.max(MAX_CAPACITY - totalStock, 0);

  const [date, setDate] = useState(() => {
    const today = new Date();
    const toDate = new Date(today);
    toDate.setDate(today.getDate() + 7);

    return {
      from: today,
      to: toDate,
    };
  });

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success("Order placed successfully!");
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setForm({ supplier: "", liters: 1000 });
    }
  }, [isOpen]);

  const format = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { from, to } = date;
    const { supplier, liters } = form;

    if (!supplier || !liters) {
      return toast.warning("Missing Information!", {
        description:
          "Please provide both the supplier and the number of liters. These fields are required.",
      });
    }

    if (liters < MIN_REQUEST) {
      return setShowMinAlert(true);
    }

    // check if liters > available capacity
    if (liters > availableCapacity) {
      return setShowAlert(true);
    }

    dispatch(
      SAVE({
        token,
        data: {
          ...form,
          role: "administrator",
          action: "order",
          fuelName: selected?.name,
          ltrs: form.liters,
          performBy: auth?._id,
          supplierName: suppliers.find(({ _id }) => form.supplier === _id)
            ?.name,
          liters: { incoming: form.liters },
          fuel: selected._id,
          expectedDelivery: { from: format(from), to: format(to) },
          amount: cost * form.liters,
          status: "incoming",
        },
      }),
    ).then((action) => {
      const { payload } = action.payload || {};
      const { liters = {} } = payload;
      const _fuels = [...fuels];
      const index = _fuels.findIndex(({ _id }) => _id === payload.fuel);
      const { incoming: cIncoming = 0 } = _fuels[index] || {};
      _fuels[index] = {
        ..._fuels[index],
        incoming: cIncoming + liters.incoming,
      };
      dispatch(SetCOLLECTIONS(_fuels));
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[22rem]">
          <DialogHeader>
            <DialogTitle>
              <Card className={"w-12 h-12 p-2 rounded-md"}>
                <CardContent
                  className={"p-0 m-0 flex items-center justify-center"}
                >
                  <img
                    src={machineLogo}
                    alt=""
                    className="h-[18px] w-[18px] mt-[5px]"
                  />
                </CardContent>
              </Card>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="-mt-1 mb-5">
              <h2 className="text-2xl font-[700]">Fuel Restock</h2>
              <div className="text-[15px] font-[600] text-[#414651] mt-2">
                Fuel Type Selected:
                <Badge className="bg-[#FFEAEA] text-[#C60000] ml-1 text-[13px] font-[700]">
                  {capitalize(selected?.name)} P{formattedAmount(cost)}L
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label className="font-[600] text-[15px]">
                  Select Supplier:
                </Label>
                <Select
                  value={form.supplier ?? ""}
                  onValueChange={(value) =>
                    setForm({ ...form, supplier: value })
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Suppliers</SelectLabel>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="liters" className="font-[600] text-[15px]">
                  Liters
                </Label>
                <Input
                  id="liters"
                  placeholder="Enter liters here.."
                  value={form.liters ?? ""}
                  required
                  onChange={(e) =>
                    setForm({ ...form, liters: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex align-items-center">
                <h2 className="text-[15px] font-[600]">
                  Total: {formattedAmount(form.liters * cost)}
                </h2>
              </div>

              <div className="grid gap-2">
                <h2 className="font-[500] text-[15px]">
                  Expected Delivery Date:
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon />
                      {date?.from ? (
                        date?.to ? (
                          <>
                            {format(date.from)} - {format(date.to)}
                          </>
                        ) : (
                          <>{format(date.from)}</>
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
            </div>

            <DialogFooter className="mt-7">
              <Button
                type="submit"
                disabled={formSubmitted}
                className="bg-[#FF4F00] hover:bg-[#e64500] w-full transition-colors duration-200 cursor-pointer"
              >
                Order {formSubmitted && <Loader className="animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Over Capacity */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Order exceeds capacity</AlertDialogTitle>
            <AlertDialogDescription>
              You are trying to order more fuel than the tank can safely store.
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
              Please adjust your order. The maximum you can request now is{" "}
              <strong>{availableCapacity?.toLocaleString()} liters</strong> to
              avoid overfilling the tank.
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
              Adjust to Max ({availableCapacity?.toLocaleString()} L)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Minimum Request Alert */}
      <AlertDialog open={showMinAlert} onOpenChange={setShowMinAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request below minimum</AlertDialogTitle>
            <AlertDialogDescription>
              You are trying to request less than the minimum liters allowed.
              <br />
              <br />
              The minimum request is{" "}
              <strong>{MIN_REQUEST?.toLocaleString()} liters</strong>.
              <br />
              <br />
              Please adjust your request to meet the minimum requirement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowMinAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setForm({ ...form, liters: MIN_REQUEST });
                setShowMinAlert(false);
              }}
            >
              Adjust to Min ({MIN_REQUEST?.toLocaleString()} L)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Order;
