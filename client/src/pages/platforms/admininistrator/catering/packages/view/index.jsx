import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import { Users } from "lucide-react";
import Header from "./header";
import Body from "./body";

const ViewDetails = ({ selected = {}, isOpen, setIsOpen = () => {} }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>View Details</DialogTitle>
          <DialogDescription>
            Double check the details of your package.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <Header selected={selected} />
          <Body selected={selected} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetails;
