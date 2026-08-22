import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "./header";
import Body from "./body";

const ViewDetails = ({ selected = {}, isOpen, setIsOpen = () => {} }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Package Details</DialogTitle>
          <DialogDescription>
            Explore the package information, menus, pricing, and inclusions.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Header selected={selected} />
          <Body selected={selected} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetails;
