import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import CustomModal from "./modal";
import { useDispatch, useSelector } from "react-redux";
import {
  BROWSE as BROWSE_VENUES,
  DESTROY,
  UPDATE,
} from "@/services/redux/slices/events/venues";
import { BROWSE as BROWSE_EQUIPMENT } from "@/services/redux/slices/inventory/equipment";
import { BROWSE as BROWSE_SERVICES } from "@/services/redux/slices/resources/services";
import Body from "./body";
import ViewDetails from "./view";
import { CustomAlert } from "@/components/shared/alert";
import { toast } from "sonner";
import Header from "./header";
const Venues = () => {
  const { formSubmitted } = useSelector(({ venues }) => venues),
    [selected, setSelected] = useState({}),
    [isOpen, setIsOpen] = useState(false),
    [openConfirmation, setOpenConfirmation] = useState({
      availability: false,
      delete: false,
    }),
    [isViewDetails, setIsViewDetails] = useState(false),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE_VENUES());
    dispatch(BROWSE_SERVICES({ module: "venue" }));
    dispatch(BROWSE_EQUIPMENT());
  }, [dispatch]);

  const handleAction = useCallback((action, item) => {
    switch (action) {
      case "update":
        setIsOpen(true);
        break;

      case "availability":
        setOpenConfirmation((prev) => ({ ...prev, availability: true }));
        break;
      case "view":
        setIsViewDetails(true);
        break;

      default:
        setOpenConfirmation((prev) => ({ ...prev, [action]: true }));
        break;
    }
    setSelected(item);
  }, []);

  const toggleCreate = () => {
    setSelected({});
    setIsOpen(true);
  };
  const handleAvailability = () => {
    const newStatus = !selected.isAvailable;

    dispatch(
      UPDATE({
        _id: selected._id,
        isAvailable: newStatus,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success(
          `Package has been marked as ${
            newStatus ? "available" : "unavailable"
          }.`,
        );
      })
      .catch((error) => {
        console.log("error:", error);
        toast.error("Failed to update package availability.");
      });

    setOpenConfirmation((prev) => ({ ...prev, availability: false }));
  };
  const onConfirmDelete = () => {
    dispatch(
      DESTROY({
        _id: selected._id,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success(`Package successfully deleted.`);
      })
      .catch((error) => {
        console.log("error:", error);
        toast.error("Failed to delete package.");
      });

    setOpenConfirmation((prev) => ({ ...prev, delete: false }));
  };
  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card>
            <Header toggleCreate={toggleCreate} />
            <CardContent>
              <Body handleAction={handleAction} />
            </CardContent>
          </Card>
        </div>
      </div>
      <CustomModal isOpen={isOpen} setIsOpen={setIsOpen} selected={selected} />
      <ViewDetails
        selected={selected}
        setIsOpen={setIsViewDetails}
        isOpen={isViewDetails}
      />
      <CustomAlert
        isOpen={openConfirmation.availability}
        formSubmitted={formSubmitted}
        capture={handleAvailability}
        setIsOpen={(value) =>
          setOpenConfirmation((prev) => ({ ...prev, availability: value }))
        }
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Change Availability"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            Are you sure you want to change the availability of{" "}
            <span className="font-semibold text-primary">
              {selected?.name || "this venue"}
            </span>
            ? Customers{" "}
            {selected?.isAvailable
              ? "will no longer be able to book this venue."
              : "will be able to book this venue."}
          </>
        }
      />

      <CustomAlert
        isOpen={openConfirmation.delete}
        formSubmitted={formSubmitted}
        capture={onConfirmDelete}
        setIsOpen={(value) =>
          setOpenConfirmation((prev) => ({ ...prev, delete: value }))
        }
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Delete Venue"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selected?.name || "this category"}
            </span>
            ?
          </>
        }
      />
    </>
  );
};

export default Venues;
