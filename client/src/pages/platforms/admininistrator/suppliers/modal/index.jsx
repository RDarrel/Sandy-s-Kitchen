import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { SAVE, UPDATE } from "@/services/redux/slices/assets/suppliers";
const _form = {
  name: "",
  phone: "",
  address: "",
};
const CustomModal = ({
  isOpen,
  setIsOpen,
  willCreate = true,
  selected = {},
}) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ suppliers }) => suppliers),
    [form, setForm] = useState(_form),
    dispatch = useDispatch();

  useEffect(() => {
    if (willCreate) {
      setForm({});
    } else {
      setForm(selected);
    }
  }, [willCreate, selected, isOpen]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      setIsOpen(false);
    }
  }, [formSubmitted, isSuccess, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (willCreate) {
      dispatch(SAVE({ token, data: form }));
    } else {
      dispatch(UPDATE({ token, data: form }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[35rem]  ">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier’s details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label
                  htmlFor="company"
                  className={"text-[#414651] font-[400]"}
                >
                  Company name*
                </Label>
                <Input
                  type="text"
                  value={form?.name || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      name: target.value,
                    })
                  }
                  required
                  id="company"
                  placeholder="Enter company name here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="phone" className={"text-[#414651] font-[400]"}>
                  Phone Number.*
                </Label>

                <Input
                  type="text"
                  value={form?.phone || ""}
                  required
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      phone: target.value,
                    })
                  }
                  id="phone"
                  placeholder="Enter phone number here.."
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="address" className={"text-[#414651] font-[400]"}>
                Address*
              </Label>
              <Input
                type="text"
                value={form?.address || ""}
                required
                onChange={({ target }) =>
                  setForm({
                    ...form,
                    address: target.value,
                  })
                }
                id="address"
                placeholder="Enter address here.."
              />
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button
              type="submit"
              disabled={formSubmitted}
              className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
            >
              Submit {formSubmitted && <Loader className=" animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
