import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoryOptions, measurementOptions, typeOptions } from "../config";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/inventory/inventoryItem";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
const INITIAL_FORM = {
  name: "",
  type: "ingredient",
  category: "other",
  measurement: "weight",
  description: "",
};

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const NameWarning = ({ name = "", selectedId, collections = [] }) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return null;
  }

  const existingItem = collections.find(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );

  if (!existingItem) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        "{name.trim()}" already exists. Please use a different inventory item
        name.
      </p>
    </div>
  );
};

const isExistingInventoryName = (
  collections = [],
  name = "",
  selectedId,
) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    return false;
  }

  return collections.some(
    (item) =>
      normalizeName(item.name) === normalizedName && item._id !== selectedId,
  );
};

const FormField = ({ label, content, error = "" }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {content}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const InventoryModal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ inventoryItem }) => inventoryItem);
  const [form, setForm] = useState(INITIAL_FORM);
  const dispatch = useDispatch();
  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (showModal) {
      if (!willCreate) {
        setForm(selected);
      } else {
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [willCreate, selected, showModal]);

  const handleSave = () => {
    dispatch(SAVE({ data: form, token }))
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully saved inventory item.");
      })
      .catch((error) =>
        toast.error(
          error?.message || error || "Failed to save inventory item.",
        ),
      );
  };
  const handleupdate = () => {
    dispatch(UPDATE({ data: form, token }))
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success("Successfully updated inventory item.");
      })
      .catch((error) =>
        toast.error(
          error?.message || error || "Failed to update inventory item.",
        ),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasDuplicateName) {
      toast.error("This inventory item name already exists.");
      return;
    }
    if (willCreate) {
      handleSave();
    } else {
      handleupdate();
    }
  };
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };
  const hasDuplicateName = isExistingInventoryName(
    collections,
    form.name,
    selected?._id,
  );

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Create" : "Update"} Inventory Item
          </DialogTitle>
          <DialogDescription>
            Define the item and choose its measurement type (weight, volume, or
            pieces) for accurate tracking.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-2 md:grid-cols-2">
            <FormField
              label="Item Name"
              content={
                <>
                  <Input
                    required
                    value={form.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    placeholder="Enter inventory name"
                  />
                  <NameWarning
                    name={form.name}
                    selectedId={selected?._id}
                    collections={collections}
                  />
                </>
              }
            />

            <FormField
              label="Type"
              content={
                <Select
                  value={form.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <FormField
              label="Category"
              content={
                <Select
                  value={form.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions[form.type].map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <FormField
              label="Measurement"
              content={
                <Select
                  value={form.measurement}
                  onValueChange={(value) => handleChange("measurement", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />

            <div className="md:col-span-2">
              <FormField
                label="Description"
                content={
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                    placeholder="Add item description or internal notes"
                    rows={5}
                  />
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button variant="outline" onClick={toggle}>
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
