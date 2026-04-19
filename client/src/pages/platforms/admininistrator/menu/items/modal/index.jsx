import { useEffect, useRef, useState } from "react";
import { Loader, PhilippinePeso } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalize, Formatter } from "@/services/utilities";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  SetNEW_MENU,
  SetUPDATED_MENU,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/menu/menus";
import Bundles from "./bundles";
import { Type } from "@/services/fakeDB";
import { SAVE } from "@/services/redux/slices/menu/menus";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import MenuImage from "./image";
import Name, { isExistingMenuName } from "./name";
import Recipe from "./recipe";
import Resell from "./resell";
import {
  getInventoryCost,
  getUnitOptions,
  isPieceUnit,
  mapSelectedIngredient,
  resolveUnitValue,
} from "../../addOns/modal/utils";

const initialForm = {
  name: "",
  category: "",
  price: "",
  type: "prepared",
  description: "",
  image: null,
  bundleItems: [],
  ingredients: [],
};

const Modal = () => {
  const { token } = useSelector(({ auth }) => auth);
  const {
    showModal,
    selected,
    modalMode,
    willCreate,
    category: actCategory,
    collections,
  } = useSelector(({ menus }) => menus);
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const { collections: inventoryItems = [] } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const { collections: addOns } = useSelector(({ addOns }) => addOns);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [hasManualPrice, setHasManualPrice] = useState(false);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isSetupOnly = !willCreate && modalMode === "setup";

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (showModal) {
      if (!willCreate) {
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
          ...selected,
          ingredients: existingIngredients,
        });
        setHasManualPrice(true);
        setImagePreview(Cloudinary.getMenuImg(selected.imgId, selected._id));
      } else {
        setForm({
          ...initialForm,
          category: categories[0]?._id,
          ...(actCategory !== "all" && { category: actCategory }),
        });
        setHasManualPrice(false);
        setImagePreview("");
      }
    }
  }, [
    showModal,
    selected,
    willCreate,
    actCategory,
    categories,
    inventoryItems,
  ]);

  const toggle = () => dispatch(TOGGLE());
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleTypeChange = (value) => {
    setForm((current) => ({
      ...current,
      type: value,
      bundleItems: value === "bundle" ? current.bundleItems : [],
      ingredients: [],
    }));
  };

  const selectedIngredientRows = form.ingredients.map((entry, index) => {
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

  const totalEstimatedInventoryCost = selectedIngredientRows.reduce(
    (total, entry) => total + (entry.estimatedCost || 0),
    0,
  );

  const selectedInventoryIds = form.ingredients
    .map((entry) => entry?.inventory)
    .filter(Boolean);

  const toggleRecipeItem = (item) => {
    if (selectedInventoryIds.includes(item._id)) {
      setForm((current) => ({
        ...current,
        ingredients: current.ingredients.filter(
          (entry) => entry.inventory !== item._id,
        ),
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      ingredients: [
        {
          inventory: item._id,
          qtyPerOrder: 1,
          unit: getUnitOptions(item.measurement)[0]?.value || null,
        },
        ...current.ingredients,
      ],
    }));
  };

  const removeIngredientRow = (index) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter(
        (_, rowIndex) => rowIndex !== index,
      ),
    }));
  };

  const updateIngredientQty = (index, value) => {
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((entry, rowIndex) =>
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
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((entry, rowIndex) =>
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

  const selectedResellRow = selectedIngredientRows[0] || null;
  const totalEstimatedBundleCost = form?.bundleItems?.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const totalEstimatedResellCost = Number(
    selectedResellRow?.linkedItem?.cost || 0,
  );
  const totalEstimatedMenuCost =
    form.type === "prepared"
      ? totalEstimatedInventoryCost
      : form.type === "bundle"
        ? totalEstimatedBundleCost
        : form.type === "resell"
          ? totalEstimatedResellCost
          : 0;

  useEffect(() => {
    if (!showModal || !willCreate || hasManualPrice) return;

    setForm((current) => ({
      ...current,
      price:
        totalEstimatedMenuCost > 0
          ? String(Number(totalEstimatedMenuCost.toFixed(2)))
          : "",
    }));
  }, [hasManualPrice, showModal, totalEstimatedMenuCost, willCreate]);

  const selectResellItem = (item) => {
    const unitOptions = getUnitOptions(item.measurement);

    setForm((current) => ({
      ...current,
      ingredients:
        current.ingredients[0]?.inventory === item._id
          ? []
          : [
              {
                inventory: item._id,
                qtyPerOrder: 1,
                unit: unitOptions[0]?.value || null,
              },
            ],
    }));
  };

  const removeResellItem = () => {
    setForm((current) => ({
      ...current,
      ingredients: [],
    }));
  };

  const buildInventoryPayload = () => {
    if (!["prepared", "resell"].includes(form.type)) {
      return {
        ingredients: [],
        hasRecipe: false,
        inventory: null,
        qtyPerOrder: null,
        unit: null,
      };
    }

    const normalizedIngredients = form.ingredients.map((entry) => {
      const linkedItem =
        inventoryItems.find((item) => item?._id === entry.inventory) || null;
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
    });

    const primaryIngredient = normalizedIngredients[0] || null;

    return {
      ingredients: form.type === "prepared" ? normalizedIngredients : [],
      hasRecipe:
        form.type === "prepared" ? normalizedIngredients.length > 0 : false,
      inventory: primaryIngredient?.inventory || null,
      qtyPerOrder: primaryIngredient?.qtyPerOrder || null,
      unit: primaryIngredient?.unit || null,
    };
  };

  const handleSave = async (payload) => {
    try {
      const { payload: savedPayload } = await dispatch(
        SAVE({ data: payload, token }),
      ).unwrap();
      const buildForm = Cloudinary.buildFileForm(
        form.image,
        "menus",
        savedPayload._id,
        {
          menuId: savedPayload._id,
        },
      );
      const { imgId } = await dispatch(
        UPLOAD({ data: buildForm, token }),
      ).unwrap();

      dispatch(SetNEW_MENU({ ...savedPayload, imgId }));
      toast.success("Successfully saved menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to save menu.");
    } finally {
      setSubmitting(false);
      setShowPriceWarning(false);
      setPendingPayload(null);
      setHasManualPrice(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };
  const handleUpdate = async (payload) => {
    try {
      const { payload: updatedPayload } = await dispatch(
        UPDATE({ data: payload, token }),
      ).unwrap();
      let imgId = selected.imgId;

      if (form.image) {
        const buildForm = Cloudinary.buildFileForm(
          form.image,
          "menus",
          updatedPayload._id,
          {
            menuId: updatedPayload._id,
          },
        );
        const imgPayload = await dispatch(
          UPLOAD({ data: buildForm, token }),
        ).unwrap();
        imgId = imgPayload.imgId;
      }

      dispatch(SetUPDATED_MENU({ ...updatedPayload, imgId }));
      toast.success("Successfully updated menu.");
      toggle();
    } catch (error) {
      toast.error(error?.message || error || "Failed to update menu.");
    } finally {
      setSubmitting(false);
      setShowPriceWarning(false);
      setPendingPayload(null);
      setHasManualPrice(false);
      setForm(initialForm);
      setImagePreview("");
    }
  };

  const submitPayload = async (payload) => {
    setSubmitting(true);

    if (willCreate) {
      return await handleSave(payload);
    }

    await handleUpdate(payload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This menu name already exists.");
      return;
    }

    if (!form.image && !form.imgId) {
      toast.error("Please upload a menu image.");
      return;
    }

    if (form.type === "prepared" && !form.ingredients.length) {
      toast.error("Please add at least one recipe ingredient.");
      return;
    }

    if (form.type === "resell" && !selectedResellRow) {
      toast.error("Please select one resell inventory item.");
      return;
    }

    const payload = {
      ...form,
      ...buildInventoryPayload(),
    };

    const declaredPrice = Number(payload.price || 0);
    const shouldWarnAboutPrice =
      totalEstimatedMenuCost > 0 && declaredPrice <= totalEstimatedMenuCost;

    if (shouldWarnAboutPrice) {
      setPendingPayload(payload);
      setShowPriceWarning(true);
      return;
    }

    await submitPayload(payload);
  };

  const hasDuplicateName = isExistingMenuName(
    collections,
    form.name,
    selected?._id,
  );

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent
        className={`border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)] ${
          isSetupOnly
            ? form.type === "resell"
              ? "max-w-xl"
              : "max-w-5xl"
            : form.type === "bundle" || form.type === "prepared"
              ? "max-w-5xl"
              : form.type === "resell"
                ? "max-w-xl"
                : "max-w-2xl"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            {willCreate
              ? "Create Menu Item"
              : isSetupOnly
                ? `Update ${capitalize(form.type || "prepared")} Setup`
                : "Update Menu Item"}
          </DialogTitle>
          <DialogDescription>
            {isSetupOnly
              ? "Adjust the operational setup for this menu item without changing the rest of its core details."
              : "Fill in the core details for a new kitchen or resale item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 ">
            {!isSetupOnly && (
              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-category">Category</Label>
                  <Select
                    value={form.category || ""}
                    required
                    onValueChange={(value) => handleChange("category", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {categories?.map((category, index) => (
                          <SelectItem key={index} value={category?._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="item-type">Type</Label>
                  <Select value={form.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                        {Type.collections.map((type) => (
                          <SelectItem key={type} value={type}>
                            {capitalize(type)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </section>
            )}

            {form.type === "bundle" && (
              <Bundles form={form} setForm={setForm} />
            )}

            {form.type === "prepared" && (
              <Recipe
                onToggleInventoryItem={toggleRecipeItem}
                selectedIngredientRows={selectedIngredientRows}
                onUpdateIngredientQty={updateIngredientQty}
                onUpdateIngredientUnit={updateIngredientUnit}
                onRemoveIngredientRow={removeIngredientRow}
                totalEstimatedInventoryCost={totalEstimatedInventoryCost}
                isPieceUnit={isPieceUnit}
                onIngredientQtyKeyDown={handleIngredientQtyKeyDown}
              />
            )}

            {form.type === "resell" && (
              <Resell
                selectedResellRow={selectedResellRow}
                onSelectResellItem={selectResellItem}
                onRemoveResellItem={removeResellItem}
              />
            )}

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="e.g. Pork Sisig"
                  required
                />
                <Name name={form.name} selectedId={selected?._id} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Price</Label>
                <div className="relative">
                  <PhilippinePeso className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="item-price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => {
                      setHasManualPrice(true);
                      handleChange("price", event.target.value);
                    }}
                    placeholder="0.00"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </section>

            {!isSetupOnly && (
              <section className="grid gap-6">
                <MenuImage
                  fileInputRef={fileInputRef}
                  form={form}
                  imagePreview={imagePreview}
                  setForm={setForm}
                  setImagePreview={setImagePreview}
                />

                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    value={form.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                    placeholder="Add a short product description for staff and menu display."
                    className="min-h-28 resize-none"
                  />
                </div>
              </section>
            )}

            <section className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={toggle}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || hasDuplicateName}>
                {willCreate ? "Save" : isSetupOnly ? "Update Setup" : "Update"}
                {submitting && <Loader className="animate-spin" />}
              </Button>
            </section>
          </div>
        </form>
      </DialogContent>

      <AlertDialog open={showPriceWarning} onOpenChange={setShowPriceWarning}>
        <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Review menu price</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  The price you entered may leave little to no profit on this
                  menu item.
                </p>

                <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      Declared Price
                    </span>
                    <span className="text-base font-semibold text-foreground">
                      {Formatter.amount(Number(form.price || 0))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      Estimated Cost
                    </span>
                    <span className="text-base font-semibold text-destructive">
                      {Formatter.amount(totalEstimatedMenuCost)}
                    </span>
                  </div>
                </div>

                <p>
                  Since your selling price is not higher than the estimated
                  cost, this item could earn very little or even lose money. Do
                  you still want to continue?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowPriceWarning(false);
                setPendingPayload(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!pendingPayload) return;
                setShowPriceWarning(false);
                await submitPayload(pendingPayload);
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default Modal;
