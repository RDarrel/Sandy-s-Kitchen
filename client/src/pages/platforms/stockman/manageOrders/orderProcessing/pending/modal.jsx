import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { Loader, PencilLine } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { formattedDate, fullName } from "@/services/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UPDATE, RESET } from "@/services/redux/slices/procurement/purchases";

const CustomModal = ({ isOpen, setIsOpen, selected, readOnly = false }) => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    [form, setForm] = useState({}),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const { liters } = selected;
      setForm({ received: liters?.incoming });
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success("Purchase has been received successfully!");
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, dispatch]);

  const { fuel, supplier, expectedDelivery, liters } = selected || {};
  const { from = "", to = "" } = expectedDelivery || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const { _id } = selected;
    const purchase = {
      _id,
      liters: { ...selected?.liters, received: form.received },
      status: "received",
      received: {
        by: auth._id,
        date: formattedDate(new Date()),
        amount: form.received * fuel?.pricing?.cost,
        remarks: form.remarks,
      },
    };
    const { received = 0, remarks } = form || {};
    const discrepancy = liters?.incoming - received;

    const discrepancyPurchase = {
      fuel: fuel._id,
      supplier: supplier._id,
      status: "request",
      liters: {
        ...selected?.liters,
        request: discrepancy,
        incoming: 0,
        order: liters?.incoming,
        firstDelivery: form?.received,
      },
      amount: discrepancy * fuel?.pricing?.cost,
      isShort: true,
      request: {
        by: auth._id,
        remarks,
      },
    };

    dispatch(
      UPDATE({
        token,
        data: {
          purchase,
          performBy: auth?._id,
          auditType: "receivedReq",
          role: "stockman",
          fuelName: fuel?.name,
          ltrs: form.received,
          supplierName: supplier?.name,
          ...(discrepancy > 0 && { discrepancyPurchase }),
        },
      }),
    );
  };

  const computeDiscrepancyLiters = () => {
    const { received = 0 } = form || {};
    const discrepancy = !readOnly
      ? liters?.incoming - received
      : liters?.incoming - liters?.received;
    return discrepancy > 0 ? `${discrepancy} L` : "0 L";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[50rem]  ">
        <DialogHeader>
          <DialogTitle>
            {!readOnly ? "Pending Order" : "Received Order"}
          </DialogTitle>
          <DialogDescription>
            {!readOnly
              ? "This order is awaiting confirmation. Please review the details and receive the fuel delivery once verified."
              : `Received By: ${fullName(selected?.received?.by?.fullName)}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            {[
              { label: "Supplier", value: supplier?.name },
              { label: "Fuel Type", value: fuel?.name },
              {
                label: "Order Liters",
                value: `${liters?.incoming?.toLocaleString()}L`,
              },
              {
                label: !readOnly ? "Expected Delivery Date:" : "Received Date",
                value: !readOnly
                  ? from
                    ? `${from} to ${to}`
                    : from
                  : selected?.received?.date,
              },
            ].map(({ label, value }, index) => (
              <div
                className="flex items-center justify-between bg-[#F5F2ED] p-2 rounded-md"
                key={index}
              >
                <h2 className="text-[#7A7977]">{label}:</h2>
                <h2 className="font-[600]">{value}</h2>
              </div>
            ))}

            <hr className="my-5" />
            <div>
              <Card className={"w-10 p-0 m-0 rounded-sm"}>
                <CardContent
                  className={"flex items-center justify-center p-0 h-10"}
                >
                  <PencilLine className="h-5 text-[#FF4F00]" strokeWidth={3} />
                </CardContent>
              </Card>
              <h2 className="mt-2 font-[500] text-[22px] text-[#FF4F00]">
                Receiving Liters
              </h2>
              <h2 className=" text-[#808080] italic text-[13px]">
                (Enter the actual number of liters received)
              </h2>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-7">
              <div className="grid grid-cols-2 gap-10">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="receiveLiters">Receive Liters</Label>
                  <Input
                    type="number"
                    value={!readOnly ? form?.received : liters?.received}
                    required
                    onChange={({ target }) => {
                      const received = Number(target.value);
                      const request = liters?.incoming;
                      setForm({
                        ...form,
                        received: received > request ? request : received,
                      });
                    }}
                    id="receiveLiters"
                    placeholder="Enter receive liters here.."
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="discrepancyLiters">Discrepancy Liters</Label>
                  <Input
                    type="text"
                    className={"bg-[#F4E3DB] border border-[#FF4F00]"}
                    id="discrepancyLiters"
                    value={computeDiscrepancyLiters()}
                    disabled
                  />
                </div>
              </div>

              <div className="grid w-full gap-1.5">
                <Label htmlFor="message-2">Remarks</Label>
                <Textarea
                  value={!readOnly ? form?.remarks : selected?.remarks}
                  readOnly={readOnly}
                  onChange={({ target }) =>
                    setForm({ ...form, remarks: target.value })
                  }
                  placeholder="Type your remarks here."
                  id="message-2"
                />
              </div>
            </div>
          </div>
          {!readOnly && (
            <DialogFooter className="mt-5">
              <Button
                type="submit"
                disabled={formSubmitted}
                className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
              >
                Receive {formSubmitted && <Loader className=" animate-spin" />}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
