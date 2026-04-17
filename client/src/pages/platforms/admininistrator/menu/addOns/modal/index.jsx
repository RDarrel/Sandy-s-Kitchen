import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Plus, Search, Trash2 } from "lucide-react";
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
import { formattedAmount, Stock } from "@/services/utilities";
import { SAVE, TOGGLE, UPDATE } from "@/services/redux/slices/menu/menuAddOns";

const GROUP_OPTIONS = [
  { label: "Extras", value: "extras" },
  { label: "Toppings", value: "toppings" },
  { label: "Sides", value: "sides" },
  { label: "Drinks", value: "drinks" },
];

const INVENTORY_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Ingredient", value: "ingredient" },
  { label: "Resell", value: "resell" },
];

const INVENTORY_CATEGORY_OPTIONS = {
  all: [{ label: "All Categories", value: "all" }],
  ingredient: [
    { label: "All Categories", value: "all" },
    { label: "Meat", value: "meat" },
    { label: "Vegetable", value: "vegetable" },
    { label: "Seafood", value: "seafood" },
    { label: "Grain", value: "grain" },
    { label: "Dairy", value: "dairy" },
    { label: "Condiment", value: "condiment" },
    { label: "Other", value: "other" },
  ],
  resell: [
    { label: "All Categories", value: "all" },
    { label: "Beverage", value: "beverage" },
    { label: "Snack", value: "snack" },
    { label: "Other", value: "other" },
  ],
};

const INITIAL_FORM = {
  name: "",
  price: "",
  description: "",
  group: "extras",
  usesInventory: false,
  ingredients: [],
};

const INITIAL_FILTERS = {
  type: "all",
  category: "all",
  search: "",
};

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const getExistingAddOn = (collections = [], name = "", selectedId) => {
  const normalizedName = normalizeName(name);

  if (!normalizedName) return null;

  return collections.find(
    (item) =>
      normalizeName(item?.name) === normalizedName && item?._id !== selectedId,
  );
};

const mapSelectedIngredient = (entry, inventoryItems) => {
  const linkedInventoryId = entry?.inventory?._id || entry?.inventory || "";
  const linkedInventory =
    inventoryItems.find((item) => item?._id === linkedInventoryId) || null;

  return {
    inventory: linkedInventory?._id || "",
    qtyPerOrder: entry?.qtyPerOrder ?? 1,
    unit:
      entry?.unit ||
      (linkedInventory ? Stock.getUnit(linkedInventory.measurement) : null),
  };
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
    useSelector(({ menuAddOns }) => menuAddOns);
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItem }) => inventoryItem,
  );

  const [form, setForm] = useState(INITIAL_FORM);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

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

    setFilters(INITIAL_FILTERS);
  }, [inventoryItems, selected, showModal, willCreate]);

  const hasDuplicateName = useMemo(() => {
    return !!getExistingAddOn(collections, form.name, selected?._id);
  }, [collections, form.name, selected?._id]);

  const selectedInventoryIds = useMemo(() => {
    return form.ingredients.map((entry) => entry.inventory).filter(Boolean);
  }, [form.ingredients]);

  const filteredInventoryItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesType =
        filters.type === "all" ? true : item?.type === filters.type;
      const matchesCategory =
        filters.category === "all" ? true : item?.category === filters.category;
      const matchesSearch = filters.search
        ? item?.name?.toLowerCase().includes(filters.search.toLowerCase())
        : true;

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [filters, inventoryItems]);

  const selectedIngredientRows = useMemo(() => {
    return form.ingredients.map((entry, index) => {
      const linkedItem =
        inventoryItems.find((item) => item?._id === entry.inventory) || null;

      return {
        index,
        ...entry,
        linkedItem,
      };
    });
  }, [form.ingredients, inventoryItems]);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      if (key === "type") {
        return {
          ...prev,
          type: value,
          category: "all",
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
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
          unit: Stock.getUnit(item.measurement),
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
              qtyPerOrder: value,
            }
          : entry,
      ),
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Add-on name is required.");
      return false;
    }

    if (!form.price || Number(form.price) < 0) {
      toast.error("Please enter a valid price.");
      return false;
    }

    if (hasDuplicateName) {
      toast.error("This add-on name already exists.");
      return false;
    }

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
      }
    }

    return true;
  };

  const buildPayload = () => {
    const normalizedIngredients = form.usesInventory
      ? form.ingredients.map((entry) => ({
          inventory: entry.inventory,
          qtyPerOrder: Number(entry.qtyPerOrder),
          unit: entry.unit,
        }))
      : [];

    const primaryIngredient = normalizedIngredients[0] || null;

    return {
      ...form,
      price: Number(form.price),
      ingredients: normalizedIngredients,
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
        setFilters(INITIAL_FILTERS);
        toast.success(successMessage);
      })
      .catch((error) => {
        toast.error(error?.message || error || errorMessage);
      });
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className=" border-border bg-card sm:max-w-5xl">
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
              <FormField label="Price" required>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    handleChange("price", event.target.value)
                  }
                  placeholder="0.00"
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

          <div className="rounded-xl border border-border px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-foreground">
                  Uses Inventory
                </Label>
                <p className="text-xs text-muted-foreground">
                  Choose yes if this add-on deducts stock from one or more
                  inventory items.
                </p>
              </div>

              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={form.usesInventory}
                    onChange={() => handleUsesInventoryChange(true)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Yes
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={!form.usesInventory}
                    onChange={() => handleUsesInventoryChange(false)}
                    className="h-4 w-4 rounded border-input"
                  />
                  No
                </label>
              </div>
            </div>

            {form.usesInventory ? (
              <div className="mt-4 grid gap-4 border-t border-border pt-4 xl:grid-cols-[1.05fr_auto_0.95fr] xl:items-stretch">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="space-y-1 border-b border-border px-4 py-3">
                    <p className="text-base font-semibold text-foreground">
                      Browse Inventory
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Search and filter items, then add what this add-on uses.
                    </p>
                  </div>

                  <div className="space-y-3 p-3">
                    <div className="grid gap-2 md:grid-cols-12">
                      <div className="relative md:col-span-5">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={filters.search}
                          onChange={(event) =>
                            handleFilterChange("search", event.target.value)
                          }
                          placeholder="Search inventory items..."
                          className="pl-9"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Select
                          value={filters.type}
                          onValueChange={(value) =>
                            handleFilterChange("type", value)
                          }
                        >
                          <SelectTrigger className="w-full bg-transparent">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {INVENTORY_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-4">
                        <Select
                          value={filters.category}
                          onValueChange={(value) =>
                            handleFilterChange("category", value)
                          }
                        >
                          <SelectTrigger className="w-full bg-transparent">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              INVENTORY_CATEGORY_OPTIONS[filters.type] ||
                              INVENTORY_CATEGORY_OPTIONS.all
                            ).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="h-[300px] overflow-auto rounded-[10px] border border-border bg-card">
                      {filteredInventoryItems.length ? (
                        filteredInventoryItems.map((item) => {
                          const isSelected = selectedInventoryIds.includes(
                            item._id,
                          );

                          return (
                            <div
                              key={item._id}
                              role="button"
                              tabIndex={0}
                              onClick={() => addInventoryItem(item)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  addInventoryItem(item);
                                }
                              }}
                              className={`flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0 ${
                                isSelected
                                  ? "cursor-default bg-[color:color-mix(in_srgb,var(--primary)_7%,white)] shadow-[inset_4px_0_0_var(--color-primary)]"
                                  : "cursor-pointer bg-card transition hover:bg-muted/40"
                              }`}
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {item.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{item.category}</span>
                                  <span className="text-border">•</span>
                                  <span>{item.type}</span>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                                <p className="text-sm font-semibold text-foreground">
                                  P{formattedAmount(item.cost || 0)}
                                </p>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    addInventoryItem(item);
                                  }}
                                  className={`text-xs font-medium ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {isSelected ? "Added" : "Add"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                          No inventory items matched your filters.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden xl:flex xl:h-full xl:items-center xl:justify-center">
                  <div className="relative flex h-full min-h-[360px] items-center justify-center px-1">
                    <div className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 bg-border" />
                    <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="space-y-1 border-b border-border px-4 py-3">
                    <p className="text-base font-semibold text-foreground">
                      Selected Items
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Set quantity for each selected item.
                    </p>
                  </div>

                  <div className="h-[356px] overflow-auto">
                    {selectedIngredientRows.length ? (
                      selectedIngredientRows.map((entry) => (
                        <div
                          key={`${entry.index}-${entry.inventory}`}
                          className="flex items-center gap-2 border-b border-border px-3 py-2.5 last:border-b-0"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {entry.linkedItem?.name || "Unknown item"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              P{formattedAmount(entry.linkedItem?.cost || 0)}{" "}
                              each
                            </p>
                          </div>

                          <div className="w-[72px] shrink-0">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={entry.qtyPerOrder}
                              onChange={(event) =>
                                updateIngredientQty(
                                  entry.index,
                                  event.target.value,
                                )
                              }
                              placeholder="1"
                              className="h-8 text-center text-sm"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeIngredientRow(entry.index)}
                            className="h-8 shrink-0 px-3 text-xs"
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="flex min-h-[220px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
                        Selected inventory items will appear here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

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
