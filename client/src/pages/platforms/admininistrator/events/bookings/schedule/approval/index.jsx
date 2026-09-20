import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const _form = {
  name: "",
  contact: {
    person: "",
    mobile: "",
  },
  address: "",
};
const Approval = ({ isOpen, setIsOpen, willCreate = true, selected = {} }) => {
  const isBoth = selected?.bookingType === "both";
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier's details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          asdasd
          <DialogFooter className="mt-5">
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Approval;
