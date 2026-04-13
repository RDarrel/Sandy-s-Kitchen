import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RESET, SAVE } from "@/services/redux/slices/assets/purchases";
import machineLogo from "../../../../../assets/machineLogo.png";
import { capitalize } from "lodash";
import { Textarea } from "@/components/ui/textarea";
import { formattedDate } from "@/services/utilities";
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
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    [form, setForm] = useState({ remarks: "", liters: 1000 }),
    [showAlert, setShowAlert] = useState(false),
    [showMinAlert, setShowMinAlert] = useState(false),
    dispatch = useDispatch();
  const searchParams = new URLSearchParams(window.location.search);

  // Tanggalin ang "refill" sa URL

  const { pricing = {}, stock, request, incoming } = selected;
  const { cost = 0 } = pricing || {};

  const totalStock = stock + incoming + request;
  const availableCapacity = Math.max(MAX_CAPACITY - totalStock, 0);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success("Request sent successfully!");
      setIsOpen(false);
      dispatch(RESET());
      searchParams.delete("refill");
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [formSubmitted, isSuccess, isOpen, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setForm({ remarks: "", liters: 1000 });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { remarks, liters } = form;

    if (!liters) {
      return toast.warning("Missing Information!", {
        description: "Please provide number of liters. This field is required.",
      });
    }

    if (liters < MIN_REQUEST) {
      return setShowMinAlert(true);
    }

    if (liters > availableCapacity) {
      return setShowAlert(true);
    }

    dispatch(
      SAVE({
        token,
        data: {
          role: "stockman",
          action: "request",
          fuelName: selected?.name,
          ltrs: form.liters,
          performBy: auth?._id,
          liters: { request: liters },
          fuel: selected._id,
          amount: cost * liters,
          status: "request",
          request: {
            by: auth._id,
            remarks,
            date: formattedDate(new Date()),
          },
        },
      })
    ).then((action) => {
      const { payload } = action.payload || {};
      const { liters: litersPayload = {} } = payload;
      const _fuels = [...fuels];
      const index = _fuels.findIndex(({ _id }) => _id === payload.fuel);
      const { request: cRequest = 0 } = _fuels[index] || {};
      _fuels[index] = {
        ..._fuels[index],
        request: cRequest + litersPayload.request,
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
              <div>
                <h2 className="text-2xl font-[700]">Fuel Restock</h2>
              </div>
              <div className="text-[15px] font-[600] text-[#414651] mt-2">
                Fuel Type Selected:
                <Badge className="bg-[#FFEAEA] text-[#C60000] ml-1 text-[13px] font-[700]">
                  {capitalize(selected?.name)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-7">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label
                  htmlFor="liters"
                  className="font-normal font-[600] text-[15px]"
                >
                  Liters
                </Label>
                <Input
                  id="liters"
                  placeholder={`Enter liters (min ${MIN_REQUEST})`}
                  type={"number"}
                  value={String(form.liters) ?? ""}
                  required={true}
                  onChange={(e) =>
                    setForm({ ...form, liters: Number(e.target.value) })
                  }
                />
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                  placeholder="Type your remarks here."
                  className={"h-50"}
                  id="remarks"
                />
              </div>
            </div>

            <DialogFooter className="mt-7">
              <Button
                type="submit"
                disabled={formSubmitted}
                className="bg-[#FF4F00] hover:bg-[#e64500] w-full transition-colors duration-200 cursor-pointer"
              >
                Request {formSubmitted && <Loader className="animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Maximum Capacity Alert */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request exceeds capacity</AlertDialogTitle>
            <AlertDialogDescription>
              You are trying to request more fuel than the tank can safely
              store.
              <br />
              <br />
              <strong>Current stock:</strong> {stock?.toLocaleString()} L <br />
              {incoming ? (
                <>
                  <strong>Incoming orders:</strong> {incoming?.toLocaleString()}{" "}
                  L <br />
                </>
              ) : null}
              {request ? (
                <>
                  <strong>Request orders:</strong> {request?.toLocaleString()} L{" "}
                  <br />
                </>
              ) : null}
              <strong>Available capacity:</strong>{" "}
              {availableCapacity?.toLocaleString()} L
              <br />
              <br />
              Please adjust your request. The maximum you can request now is{" "}
              <strong>{availableCapacity?.toLocaleString()} liters</strong>.
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
