import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/shared/spinner";
import {
  SAVE,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/menu/addOns/addOns";
import AddOnInventorySection from "./inventorySection";
import {
  getExistingAddOn,
  getInventoryCost,
  getUnitOptions,
  getErrorMessage,
  GROUP_OPTIONS,
  isPieceUnit,
  mapSelectedIngredient,
  resolveUnitValue,
} from "./utils";

const INITIAL_FORM = {
  name: "",
  price: "",
  description: "",
  group: "extras",
  usesInventory: false,
  ingredients: [],
};

const FormField = ({ label, required = false, error = "", children }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">
      {label} {required ? <span className="text-destructive">*</span> : null}
    </Label>
    {children}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

const NameWarning = ({ name = "", selectedId, collections = [] }) => {
  const existingItem = getExistingAddOn(collections, name, selectedId);

  if (!existingItem) return null;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>"{name.trim()}" already exists. Please use a different add-on name.</p>
    </div>
  );
};

const AddOnModal = () => {
  const dispatch = useDispatch();

  const { token } = useSelector(({ auth }) => auth);
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ addOns }) => addOns);
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItem }) => inventoryItem,
  );

  const [form, setForm] = useState(INITIAL_FORM);

  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (!showModal) return;

    if (!willCreate && selected) {
      const existingIngredients =
        selected?.ingredients?.length > 0
          ? selected.ingredients.map((entry) =>
              mapSelectedIngredient(entry, inventoryItems),
            )
          : selected?.inventory
            ? [
                mapSelectedIngredient(
                  {
                    inventory: selected.inventory,
                    qtyPerOrder: selected.qtyPerOrder,
                    unit: selected.unit,
                  },
                  inventoryItems,
                ),
              ]
            : [];

      setForm({
        name: selected?.name || "",
        price: selected?.price ?? "",
        description: selected?.description || "",
        group: selected?.group || "extras",
        usesInventory: existingIngredients.length > 0,
        ingredients: existingIngredients,
        _id: selected?._id,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [inventoryItems, selected, showModal, willCreate]);

  const hasDuplicateName = useMemo(() => {
    return !!getExistingAddOn(collections, form.name, selected?._id);
  }, [collections, form.name, selected?._id]);

  const selectedIngredientRows = useMemo(() => {
    return form.ingredients.map((entry, index) => {
      const linkedItem =
        inventoryItems.find((item) => item?._id === entry.inventory) || null;
      const unitOptions = getUnitOptions(linkedItem?.measurement);
      const selectedUnit = resolveUnitValue(
        unitOptions,
        entry.unit,
        linkedItem?.measurement,
      );
      const estimatedCost = getInventoryCost(
        entry.qtyPerOrder,
        selectedUnit,
        linkedItem,
      );

      return {
        index,
        ...entry,
        unit: selectedUnit,
        linkedItem,
        unitOptions,
        estimatedCost,
      };
    });
  }, [form.ingredients, inventoryItems]);

  const selectedInventoryIds = useMemo(() => {
    return form.ingredients.map((entry) => entry?.inventory).filter(Boolean);
  }, [form.ingredients]);

  const totalEstimatedInventoryCost = useMemo(() => {
    return selectedIngredientRows.reduce(
      (total, entry) => total + (entry.estimatedCost || 0),
      0,
    );
  }, [selectedIngredientRows]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUsesInventoryChange = (usesInventory) => {
    setForm((prev) => ({
      ...prev,
      usesInventory,
      ingredients: usesInventory ? prev.ingredients : [],
    }));
  };

  const addInventoryItem = (item) => {
    if (selectedInventoryIds.includes(item._id)) {
      setForm((prev) => ({
        ...prev,
        ingredients: prev.ingredients.filter(
          (entry) => entry.inventory !== item._id,
        ),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          inventory: item._id,
          qtyPerOrder: 1,
          unit: getUnitOptions(item.measurement)[0]?.value || null,
        },
      ],
    }));
  };

  const removeIngredientRow = (index) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const updateIngredientQty = (index, value) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((entry, rowIndex) =>
        rowIndex === index
          ? {
              ...entry,
              qtyPerOrder: isPieceUnit(entry.unit)
                ? value.replace(/[^0-9]/g, "")
                : value,
            }
          : entry,
      ),
    }));
  };

  const updateIngredientUnit = (index, value) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((entry, rowIndex) =>
        rowIndex === index
          ? {
              ...entry,
              unit: value,
              qtyPerOrder: isPieceUnit(value)
                ? String(
                    Math.max(1, Math.round(Number(entry.qtyPerOrder) || 1)),
                  )
                : entry.qtyPerOrder,
            }
          : entry,
      ),
    }));
  };

  const handleIngredientQtyKeyDown = (event, unit) => {
    if (!isPieceUnit(unit)) return;

    if ([".", ",", "e", "E", "-", "+"].includes(event.key)) {
      event.preventDefault();
    }
  };

  const validateForm = () => {
    if (form.usesInventory) {
      if (!form.ingredients.length) {
        toast.error("Please select at least one ingredient or item.");
        return false;
      }

      for (const entry of form.ingredients) {
        if (!entry.qtyPerOrder || Number(entry.qtyPerOrder) <= 0) {
          toast.error("Please enter a valid quantity for each selected item.");
          return false;
        }

        if (
          isPieceUnit(entry.unit) &&
          !Number.isInteger(Number(entry.qtyPerOrder))
        ) {
          toast.error("Pieces must use whole numbers only.");
          return false;
        }
      }
    }

    return true;
  };

  const buildPayload = () => {
    const normalizedIngredients = form.usesInventory
      ? form.ingredients.map((entry) => {
          const linkedItem =
            inventoryItems.find((item) => item?._id === entry.inventory) ||
            null;
          const normalizedUnit = resolveUnitValue(
            getUnitOptions(linkedItem?.measurement),
            entry.unit,
            linkedItem?.measurement,
          );

          return {
            inventory: entry.inventory,
            qtyPerOrder: Number(entry.qtyPerOrder),
            unit: normalizedUnit || entry.unit,
          };
        })
      : [];

    const primaryIngredient = normalizedIngredients[0] || null;

    return {
      ...form,
      price: Number(form.price),
      ingredients: normalizedIngredients,
      hasRecipe: form.usesInventory,
      inventory: primaryIngredient?.inventory || null,
      qtyPerOrder: primaryIngredient?.qtyPerOrder || null,
      unit: primaryIngredient?.unit || null,
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const action = willCreate ? SAVE : UPDATE;
    const successMessage = willCreate
      ? "Successfully saved add-on."
      : "Successfully updated add-on.";
    const errorMessage = willCreate
      ? "Failed to save add-on."
      : "Failed to update add-on.";

    dispatch(
      action({
        data: buildPayload(),
        token,
      }),
    )
      .unwrap()
      .then(() => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success(successMessage);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, errorMessage));
      });
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent
        className={`border-border bg-card transition-[max-width] duration-200 ${
          form.usesInventory ? "sm:max-w-5xl" : "sm:max-w-2xl"
        }`}
      >
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Create" : "Update"} Add-On
          </DialogTitle>
          <DialogDescription>
            Set the basic details for this add-on option on your menu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-12">
            <div className="md:col-span-6">
              <FormField label="Name" required>
                <Input
                  required
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Enter add-on name"
                />
                <NameWarning
                  name={form.name}
                  selectedId={selected?._id}
                  collections={collections}
                />
              </FormField>
            </div>

            <div className="md:col-span-3">
              <FormField label="Price">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    handleChange("price", event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
              </FormField>
            </div>

            <div className="md:col-span-3">
              <FormField label="Group" required>
                <Select
                  value={form.group}
                  onValueChange={(value) => handleChange("group", value)}
                >
                  <SelectTrigger className="w-full bg-transparent">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="md:col-span-12">
              <FormField label="Description">
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  placeholder="Write a short description for this add-on"
                />
              </FormField>
            </div>
          </div>

          <AddOnInventorySection
            usesInventory={form.usesInventory}
            onUsesInventoryChange={handleUsesInventoryChange}
            onToggleInventoryItem={addInventoryItem}
            selectedIngredientRows={selectedIngredientRows}
            onUpdateIngredientQty={updateIngredientQty}
            onUpdateIngredientUnit={updateIngredientUnit}
            onRemoveIngredientRow={removeIngredientRow}
            totalEstimatedInventoryCost={totalEstimatedInventoryCost}
            isPieceUnit={isPieceUnit}
            onIngredientQtyKeyDown={handleIngredientQtyKeyDown}
          />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted || hasDuplicateName}>
              {willCreate ? "Save Add-On" : "Update Add-On"}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOnModal;
