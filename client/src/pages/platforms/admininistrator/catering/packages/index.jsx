import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import CustomModal from "./modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/menu/menus";
import { BROWSE as BROWSE_EQUIPMENT } from "@/services/redux/slices/inventory/equipment";
import { BROWSE as BROWSE_SERVICES } from "@/services/redux/slices/resources/services";
const Packages = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BROWSE({ station: "catering" }));
    dispatch(BROWSE_EQUIPMENT());
    dispatch(BROWSE_SERVICES({ module: "catering" }));
  }, [dispatch]);

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader>
              <div className="flex flex-row justify-between ">
                <div>
                  <CardTitle className="text-2xl text-foreground">
                    Packages
                  </CardTitle>
                  <CardDescription>
                    Manage supplier companies and their contact details.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
      <CustomModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Packages;
