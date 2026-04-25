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

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { formattedDate } from "@/services/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  UPDATE,
  RESET,
  DESTROY,
} from "@/services/redux/slices/procurement/purchases";

const CustomModal = ({ isOpen, setIsOpen, selected, readOnly = false }) => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ purchases }) => purchases),
    [isDeleted, setIsDeleted] = useState(false),
    [form, setForm] = useState({ remarks: "", liters: "" }),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const { liters, request } = selected;
      setForm({ liters: liters?.request, remarks: request?.remarks });
      setIsDeleted(false);
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success(
        `Request ${isDeleted ? "deleted" : "updated"} successfully!`,
      );
      setIsDeleted(false);
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, isDeleted, dispatch]);

  const { fuel } = selected || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const { liters, remarks } = form;
    if (!liters) {
      return toast.warning("Missing Information!", {
        description:
          "Please provide  number of liters. These fields are required.",
      });
    }
    const { _id } = selected;
    const purchase = {
      _id,
      liters: { request: liters, received: 0, pending: 0 },
      request: {
        by: auth._id,
        remarks,
        date: formattedDate(new Date()),
      },
      amount: liters * fuel?.pricing?.cost,
      updatingRequest: true,
    };

    dispatch(
      UPDATE({
        token,
        data: { purchase },
      }),
    );
  };

  const handleDelete = () => {
    setIsDeleted(true);
    dispatch(
      DESTROY({
        token,
        data: { _id: selected._id },
      }),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[26.8rem]  ">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {!readOnly ? "Request Order" : "Received Order"}
          </DialogTitle>
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
                  value={String(form.liters)}
                  min={1000}
                  required
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

            <div className="grid w-full gap-1.5">
              <Label htmlFor="message-2">Remarks</Label>
              <Textarea
                value={form?.remarks}
                onChange={({ target }) => {
                  setForm({
                    ...form,
                    remarks: target.value,
                  });
                }}
                placeholder="Type your remarks here."
                className={"h-50"}
                id="message-2"
              />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button
              type="button"
              onClick={handleDelete}
              disabled={formSubmitted}
              className="bg-[#FFFFFF] border border-[#D5D7DA] text-black transition-colors duration-200 cursor-pointer hover:bg-[#F0F0F0] hover:border-[#B0B3B8]"
            >
              Delete
              {formSubmitted && isDeleted && (
                <Loader className=" animate-spin" />
              )}
            </Button>
            <Button
              type="submit"
              disabled={formSubmitted}
              className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
            >
              Update
              {formSubmitted && !isDeleted && (
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
