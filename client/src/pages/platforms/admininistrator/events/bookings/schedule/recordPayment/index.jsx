import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BROWSE } from "@/services/redux/slices/events/paymentMethods";

import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const RecordPayment = ({ isOpen, setIsOpen, selected = {} }) => {
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const { collections: methods } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(BROWSE());
    }
  }, [isOpen]);
  console.log("payment methods:", methods);
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle> Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier's details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogFooter className="mt-5">
            <Button type="submit" disabled={formSubmitted}>
              Submit
              {formSubmitted && (
                <Loader className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPayment;
