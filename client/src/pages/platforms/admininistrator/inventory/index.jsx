import { useState } from "react";
import { Card } from "@/components/ui/card";
import InventoryBody from "./body";
import InventoryHeader from "./header";
import InventoryModal from "./modal";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const openDeleteModal = (item) => {
    setSelected(item);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selected?._id) return;

    setDeleteOpen(false);
    setSelected(null);
  };

  return (
    <>
      <div className="bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Card className="border-border bg-card py-6 shadow-sm">
            <InventoryHeader search={search} setSearch={setSearch} />

            <InventoryBody
              deleteOpen={deleteOpen}
              setDeleteOpen={setDeleteOpen}
              selected={selected}
              onRequestDelete={openDeleteModal}
              onConfirmDelete={handleDelete}
            />
          </Card>
        </div>
      </div>

      <InventoryModal />
    </>
  );
};

export default Inventory;
