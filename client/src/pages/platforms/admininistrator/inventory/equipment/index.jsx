import { Card } from "@/components/ui/card";
import { useCallback, useState } from "react";
import Body from "./body";
import Header from "./header";
import CategoryModal from "./modal";
import { useDispatch } from "react-redux";
import { DESTROY } from "@/services/redux/slices/inventory/equipment";
import { toast } from "sonner";

const Equipment = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dispatch = useDispatch();

  const openDeleteModal = useCallback((item) => {
    setSelected(item);
    setDeleteOpen(true);
  }, []);

  const handleDelete = () => {
    if (!selected?._id) return;

    dispatch(DESTROY({ data: { _id: selected._id } }))
      .unwrap()
      .then(() => {
        setSelected(null);
        setDeleteOpen(false);
        toast.success("Successfully deleted category.");
      })
      .catch(() => {
        setSelected(null);
        setDeleteOpen(false);
        toast.error("Failed to delete category.");
      });
  };

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border py-6 shadow-sm">
            <Header />
            <Body
              deleteOpen={deleteOpen}
              setDeleteOpen={setDeleteOpen}
              selected={selected}
              onRequestDelete={openDeleteModal}
              onConfirmDelete={handleDelete}
            />
          </Card>
        </div>
      </div>

      <CategoryModal />
    </>
  );
};

export default Equipment;
