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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Loader } from "lucide-react";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESET, UPDATE } from "@/services/redux/slices/persons/staffs";
import { toast } from "sonner";
import { fullName } from "@/services/utilities";

const ChangeRole = ({ isOpen, setIsOpen, selected }) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ staffs }) => staffs),
    [form, setForm] = useState({}),
    dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      const { user = {} } = selected;
      const { role, _id = "" } = user;
      setForm({ user: _id, role: role?._id });
    }
  }, [isOpen, selected]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      toast.success("Role Successfully Changed!");
      setIsOpen(false);
      dispatch(RESET());
    }
  }, [formSubmitted, isSuccess, isOpen, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(UPDATE({ token, data: { ...form, staff: selected._id } }));
  };

  const { user = {} } = selected || {};

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[25rem]  ">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>{fullName(user?.fullName)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label className="font-normal text-gray-700">Role*</Label>
              <Select
                value={form.role ?? ""}
                onValueChange={(value) => setForm({ ...form, role: value })}
                required={true}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="68221276142bcd0fef29b829">
                      Cashier
                    </SelectItem>
                    <SelectItem value="68221270142bcd0fef29b828">
                      Stockman
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-5">
            <Button
              type="submit"
              disabled={formSubmitted}
              className="bg-[#FF4F00] hover:bg-[#e64500] transition-colors duration-200 cursor-pointer"
            >
              Update {formSubmitted && <Loader className=" animate-spin" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRole;
