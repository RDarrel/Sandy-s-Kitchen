import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import CustomModal from "./modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { BROWSE as BROWSE_PACKAGES } from "@/services/redux/slices/cateringPackages";
import { BROWSE as BROWSE_MENUS } from "@/services/redux/slices/menu/menus";
import { BROWSE as BROWSE_EQUIPMENT } from "@/services/redux/slices/inventory/equipment";
import { BROWSE as BROWSE_SERVICES } from "@/services/redux/slices/resources/services";
import Body from "./body";
const Packages = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({});
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BROWSE_MENUS({ station: "catering" }));
    dispatch(BROWSE_EQUIPMENT());
    dispatch(BROWSE_SERVICES({ module: "catering" }));
    dispatch(BROWSE_PACKAGES());
  }, [dispatch]);
  const handleAction = useCallback((action, item) => {
    if (action === "update") {
      setSelected(item);
      setIsOpen(true);
    }
  }, []);

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
                    Manage catering packages with menus, inclusions, pricing,
                    and guest requirements.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Package
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Body handleAction={handleAction} />
            </CardContent>
          </Card>
        </div>
      </div>
      <CustomModal isOpen={isOpen} setIsOpen={setIsOpen} selected={selected} />
    </>
  );
};

export default Packages;
