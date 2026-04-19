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
import RecommendedAddOns from "./addOns";
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
  setupRecipe: false,
  setupBundle: false,
  setupResellLink: false,
  enableAddOns: false,
  recommendedAddOns: [],
};

const getSetupRequirementLabel = (type) => {
  if (type === "bundle") return "set up the bundle composition";
  if (type === "resell") return "link a stock item";
  return "create a recipe";
};

const getSetupOnlyDialogMeta = (type) => {
  if (type === "bundle") {
    return {
      title: "Manage Bundle Items",
      description: "Select the menu items included in this bundle.",
    };
  }

  if (type === "resell") {
    return {
      title: "Manage Inventory Link",
      description: "Link a stock item for selling and inventory tracking.",
    };
  }

  return {
    title: "Manage Recipe",
    description: "Select the ingredients used to prepare one serving.",
  };
};

const getRemoveSetupCopy = (type) => {
  if (type === "bundle") {
    return {
      title: "Confirm bundle removal",
      lead: "You removed all items from this bundle.",
      detail:
        "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you set up the bundle composition again.",
    };
  }

  if (type === "resell") {
    return {
      title: "Confirm stock link removal",
      lead: "You removed the linked stock item for this menu.",
      detail:
        "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you link a stock item again.",
    };
  }

  return {
    title: "Confirm recipe removal",
    lead: "You removed all ingredients from this recipe.",
    detail:
      "If you continue, this menu item will be saved as unavailable and it will no longer be sold until you create a recipe again.",
  };
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
  const [submitIntent, setSubmitIntent] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPriceWarning, setShowPriceWarning] = useState(false);
  const [showSetupLaterWarning, setShowSetupLaterWarning] = useState(false);
  const [showRemoveSetupWarning, setShowRemoveSetupWarning] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [pendingSetupLaterPayload, setPendingSetupLaterPayload] =
    useState(null);
  const [pendingRemoveSetupPayload, setPendingRemoveSetupPayload] =
    useState(null);
  const [hasManualPrice, setHasManualPrice] = useState(false);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isSetupOnly = !willCreate && modalMode === "setup";
  const isAddOnsOnly = !willCreate && modalMode === "addons";
  const isFullEdit = !isSetupOnly && !isAddOnsOnly;

  const shouldShowAvailabilitySaveOptions =
    !isAddOnsOnly && (willCreate || isSetupOnly);

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

        const existingRecommendedAddOns = Array.isArray(
          selected?.recommendedAddOns,
        )
          ? selected.recommendedAddOns
              .map((entry) => entry?._id || entry)
              .filter(Boolean)
          : [];

        const hasRecipeSetup = existingIngredients.length > 0;
        const hasBundleSetup = (selected?.bundleItems || []).length > 0;
        const hasResellSetup =
          selected?.type === "resell" ? existingIngredients.length > 0 : false;
        const shouldForceSetup = isSetupOnly;

        setForm({
          ...selected,
          ingredients: existingIngredients,
          setupRecipe: shouldForceSetup
            ? selected?.type === "prepared"
            : selected?.type === "prepared"
              ? hasRecipeSetup
              : false,
          setupBundle: shouldForceSetup
            ? selected?.type === "bundle"
            : selected?.type === "bundle"
              ? hasBundleSetup
              : false,
          setupResellLink: shouldForceSetup
            ? selected?.type === "resell"
            : selected?.type === "resell"
              ? hasResellSetup
              : false,
          enableAddOns: isAddOnsOnly
            ? true
            : existingRecommendedAddOns.length > 0,
          recommendedAddOns: existingRecommendedAddOns,
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
    isSetupOnly,
    isAddOnsOnly,
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
      setupRecipe: false,
      setupBundle: false,
      setupResellLink: false,
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
	      setSubmitIntent(null);
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
	      setSubmitIntent(null);
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

	    const submitter = event?.nativeEvent?.submitter || null;
	    const rawAvailabilityIntent =
	      submitter?.getAttribute?.("data-availability") || null;
	    const availabilityIntent =
	      shouldShowAvailabilitySaveOptions && !rawAvailabilityIntent
	        ? "unavailable"
	        : rawAvailabilityIntent;
	    setSubmitIntent(availabilityIntent || "default");
	    const isSavingUnavailable =
	      shouldShowAvailabilitySaveOptions &&
	      availabilityIntent === "unavailable";
	    const wantsAvailable =
	      shouldShowAvailabilitySaveOptions && availabilityIntent === "available";

    if (hasDuplicateName) {
      toast.error("This menu name already exists.");
      return;
    }

    if (!isAddOnsOnly && !form.image && !form.imgId) {
      toast.error("Please upload a menu image.");
      return;
    }

	    if (form.type === "prepared" && !form.ingredients.length) {
	      if (wantsAvailable && (willCreate || isSetupOnly)) {
	        toast.error("Please add at least one recipe ingredient.");
	        return;
	      }
	    }

	    if (form.type === "resell" && !selectedResellRow) {
	      if (wantsAvailable && (willCreate || isSetupOnly)) {
	        toast.error("Please select one resell inventory item.");
	        return;
	      }
	    }

	    if (form.type === "bundle" && form.bundleItems?.length < 2) {
	      if (wantsAvailable && (willCreate || isSetupOnly)) {
	        toast.error("Please select at least 2 menu items for this bundle.");
	        return;
	      }
	    }

    const normalizedRecommendedAddOns = form.enableAddOns
      ? Array.from(
          new Set(
            (Array.isArray(form.recommendedAddOns)
              ? form.recommendedAddOns
              : []
            )
              .map((entry) => entry?._id || entry)
              .filter(Boolean),
          ),
        )
      : [];

    const payload = {
      ...form,
      recommendedAddOns: normalizedRecommendedAddOns,
      ...buildInventoryPayload(),
      ...(shouldShowAvailabilitySaveOptions
        ? { isAvailable: wantsAvailable }
        : {}),
    };

    const isRemovingSetup =
      !willCreate &&
      Boolean(selected?.isAvailable) &&
      (form.type === "prepared"
        ? payload.ingredients.length === 0
        : form.type === "bundle"
          ? payload.bundleItems.length === 0
          : form.type === "resell"
            ? !payload.inventory
            : false);

    if (isRemovingSetup) {
      setPendingRemoveSetupPayload({ ...payload, isAvailable: false });
      setShowRemoveSetupWarning(true);
      return;
    }

	    if (willCreate && !shouldShowAvailabilitySaveOptions) {
	      setPendingSetupLaterPayload({ ...payload, isAvailable: false });
	      setShowSetupLaterWarning(true);
	      return;
	    }

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
          isAddOnsOnly
            ? "max-w-5xl"
            : isSetupOnly
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
	              : isAddOnsOnly
	                ? "Manage Add-Ons"
	                : isSetupOnly
	                  ? getSetupOnlyDialogMeta(form.type || "prepared").title
	                  : "Update Menu Item"}
	          </DialogTitle>
	          <DialogDescription>
	            {isAddOnsOnly
	              ? "Choose the add-ons that will be suggested for this menu item."
	              : isSetupOnly
	                ? getSetupOnlyDialogMeta(form.type || "prepared").description
	                : "Fill in the core details for a new kitchen or resale item."}
	          </DialogDescription>
	        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 ">
            {isFullEdit && (
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

            {!isAddOnsOnly && form.type === "bundle" && (
              <Bundles
                form={form}
                setForm={setForm}
                enabled
                hideToggle
                onEnabledChange={() => {}}
              />
            )}

            {!isAddOnsOnly && form.type === "prepared" && (
              <Recipe
                enabled
                hideToggle
                onEnabledChange={() => {}}
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

            {!isAddOnsOnly && form.type === "resell" && (
              <Resell
                enabled
                hideToggle
                onEnabledChange={() => {}}
                selectedResellRow={selectedResellRow}
                onSelectResellItem={selectResellItem}
                onRemoveResellItem={removeResellItem}
              />
            )}

            {isAddOnsOnly ? (
              <section className="rounded-[15px] border border-border bg-white shadow-sm">
                <div className="border-b border-border px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">
                    {form.name || "Menu Item"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SRP {Formatter.amount(Number(form.price || 0))}
                  </p>
                </div>
              </section>
            ) : (
              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
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
            )}

            {isFullEdit && (
              <>
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

                <RecommendedAddOns
                  collections={addOns}
                  enabled={form.enableAddOns}
                  hideToggle={
                    !willCreate && (form.recommendedAddOns?.length || 0) > 0
                  }
                  onEnabledChange={(value) => {
                    handleChange("enableAddOns", value);
                    if (!value) {
                      handleChange("recommendedAddOns", []);
                    }
                  }}
                  selectedIds={form.recommendedAddOns}
                  onSelectedIdsChange={(ids) =>
                    handleChange("recommendedAddOns", ids)
                  }
                />
              </>
            )}

            {isAddOnsOnly && (
              <RecommendedAddOns
                collections={addOns}
                enabled
                hideToggle
                onEnabledChange={() => {}}
                selectedIds={form.recommendedAddOns}
                onSelectedIdsChange={(ids) =>
                  handleChange("recommendedAddOns", ids)
                }
              />
            )}

            <section className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={toggle}
                disabled={submitting}
              >
                Close
              </Button>

	              {shouldShowAvailabilitySaveOptions ? (
	                <>
	                  <Button
	                    type="submit"
	                    variant="outline"
	                    disabled={submitting || hasDuplicateName}
	                    data-availability="unavailable"
	                    onClick={() => setSubmitIntent("unavailable")}
	                  >
	                    Save as unavailable
	                    {submitting && submitIntent === "unavailable" && (
	                      <Loader className="animate-spin" />
	                    )}
	                  </Button>
	                  <Button
	                    type="submit"
	                    disabled={submitting || hasDuplicateName}
	                    data-availability="available"
	                    onClick={() => setSubmitIntent("available")}
	                  >
	                    Save & make available
	                    {submitting && submitIntent === "available" && (
	                      <Loader className="animate-spin" />
	                    )}
	                  </Button>
	                </>
	              ) : (
                <Button type="submit" disabled={submitting || hasDuplicateName}>
	                  {willCreate
	                    ? "Save"
	                    : isSetupOnly
	                      ? "Update Setup"
	                      : "Update"}
	                  {submitting && <Loader className="animate-spin" />}
	                </Button>
	              )}
            </section>
          </div>
        </form>
      </DialogContent>

      <AlertDialog
        open={showSetupLaterWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowSetupLaterWarning(false);
            setPendingSetupLaterPayload(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Saved as unavailable</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This menu item will be saved, but it won&apos;t be available
                  for selling yet.
                </p>
                <p>
                  To make it available later, open the setup and{" "}
                  {getSetupRequirementLabel(form.type)}.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => {
                setShowSetupLaterWarning(false);
                setPendingSetupLaterPayload(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={async () => {
                if (!pendingSetupLaterPayload) return;
                setShowSetupLaterWarning(false);
                await submitPayload(pendingSetupLaterPayload);
                setPendingSetupLaterPayload(null);
              }}
            >
              Save as unavailable
              {submitting && <Loader className="animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showRemoveSetupWarning}
        onOpenChange={(open) => {
          if (!open) {
            setShowRemoveSetupWarning(false);
            setPendingRemoveSetupPayload(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md border border-border bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getRemoveSetupCopy(form.type).title}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-foreground">
                  {getRemoveSetupCopy(form.type).lead}
                </p>
                <p>{getRemoveSetupCopy(form.type).detail}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              onClick={() => {
                setShowRemoveSetupWarning(false);
                setPendingRemoveSetupPayload(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={submitting}
              onClick={async () => {
                if (!pendingRemoveSetupPayload) return;
                setShowRemoveSetupWarning(false);
                await submitPayload(pendingRemoveSetupPayload);
                setPendingRemoveSetupPayload(null);
              }}
            >
              Proceed & save as unavailable
              {submitting && <Loader className="animate-spin" />}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
