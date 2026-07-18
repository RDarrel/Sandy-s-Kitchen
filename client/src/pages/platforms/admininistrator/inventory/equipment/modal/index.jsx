import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/inventory/equipment";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, UNITS, INITIAL_FORM } from "./constant";
import Spinner from "@/components/shared/spinner";
import { getExistingCategory } from "./utils";
import { NameWarning, FormField } from "./components";

const InventoryModal = () => {
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ equipment }) => equipment);
  const [form, setForm] = useState(INITIAL_FORM);
  const dispatch = useDispatch();

  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (showModal) {
      if (!willCreate && selected) {
        setForm({
          ...INITIAL_FORM,
          ...selected,
        });
      } else {
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [willCreate, selected, showModal]);
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const hasDuplicateName = !!getExistingCategory(
    collections,
    form.name,
    selected?._id,
  );

  const handleSave = () => {
    dispatch(
      SAVE({
        data: form,
      }),
    )
      .unwrap()
      .then((action) => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success(action.success);
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to save category."),
      );
  };

  const handleUpdate = () => {
    dispatch(
      UPDATE({
        data: form,
      }),
    )
      .unwrap()
      .then((action) => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success(action.success);
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to update category."),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This equipment name already exists.");
      return;
    }

    if (willCreate) {
      handleSave();
    } else {
      handleUpdate();
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-1xl">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Create" : "Update"} Equipment
          </DialogTitle>
          <DialogDescription>
            Enter the equipment details to make it available for catering and
            venue reservations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mb-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FormField
                  label="Name"
                  content={
                    <>
                      <Input
                        required
                        value={form.name}
                        onChange={(event) =>
                          handleChange("name", event.target.value)
                        }
                        placeholder="Enter category name"
                      />
                      <NameWarning
                        name={form.name}
                        selectedId={selected?._id}
                        collections={collections}
                      />
                    </>
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      {CATEGORIES.map((category, idx) => (
                        <SelectItem value={category} key={idx}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FormField
                  label="Total Quantity"
                  content={
                    <>
                      <Input
                        required
                        value={String(form.totalQty || "")}
                        onChange={(event) =>
                          handleChange("totalQty", Number(event.target.value))
                        }
                        placeholder="Enter category name"
                      />
                    </>
                  }
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(value) => handleChange("unit", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Unit</SelectLabel>
                      {UNITS.map((unit, idx) => (
                        <SelectItem value={unit} key={idx}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FormField
                label="Description"
                content={
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                    placeholder="Add category description or internal notes"
                    rows={5}
                  />
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted || hasDuplicateName}>
              {willCreate ? "Save" : "Update"}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
