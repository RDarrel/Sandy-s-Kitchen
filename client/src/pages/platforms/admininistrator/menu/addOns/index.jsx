import { Card } from "@/components/ui/card";
import { useState } from "react";
import Body from "./body";
import Header from "./header";
import Modal from "./modal";
import { useDispatch, useSelector } from "react-redux";
import { DESTROY } from "@/services/redux/slices/menu/category";
import { toast } from "sonner";

const AddOns = () => {
  const { token } = useSelector(({ auth }) => auth);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dispatch = useDispatch();

  const openDeleteModal = (item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selected?._id) return;

    dispatch(DESTROY({ data: { _id: selected._id }, token }))
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

      <Modal />
    </>
  );
};

export default AddOns;
