import Cloudinary from "@/services/utilities/cloudinary";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { capitalize, Formatter } from "@/services/utilities";
import {
  ChevronDown,
  EllipsisVertical,
  Layers3,
  Pencil,
  Plus,
  Soup,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DESTROY, Set_SELECTED } from "@/services/redux/slices/menu/menus";
import ItemSkeleton from "./item-skeleton";
import EmptyState from "./empty-state";
import Confirmation from "./confirmation";
import { toast } from "sonner";

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

const EMPTY_STATE_BY_TYPE = {
  bundle: "No bundled menu items added yet.",
  prepared: "No recipe ingredients added yet.",
  resell: "No linked resell inventory item yet.",
};

const DETAIL_HINT_BY_TYPE = {
  bundle: "Review bundled items",
  prepared: "Review full recipe setup",
  resell: "Review linked stock item",
};

const EMPTY_CTA_BY_TYPE = {
  bundle: {
    title: "This bundle is not set up yet.",
    action: "Manage bundle",
  },
  prepared: {
    title: "No recipe ingredients added yet.",
    action: "Manage recipe",
  },
  resell: {
    title: "No linked resell stock yet.",
    action: "Manage stock link",
  },
};

const getMenuTypeMeta = (type) => {
  switch (type) {
    case "bundle":
      return {
        icon: Layers3,
        title: "Bundle Composition",
        summaryLabel: "bundled items",
      };
    case "resell":
      return {
        icon: Store,
        title: "Resell Link",
        summaryLabel: "linked item",
      };
    case "prepared":
    default:
      return {
        icon: Soup,
        title: "Recipe Ingredients",
        summaryLabel: "ingredients",
      };
  }
};

const getDetailEntries = (item, categories = []) => {
  if (item.type === "bundle") {
    return (item.bundleItems || []).map((entry) => ({
      id: entry._id || entry.id,
      name: entry.name || "Unknown menu item",
      quantity: Number(entry.quantity || 1),
      price: Number(entry.price || 0),
      category:
        categories.find((category) => category._id === entry.category)?.name ||
        entry.category,
      type: entry.type || null,
    }));
  }

  return (item.ingredients || []).map((entry, index) => ({
    id: entry?.inventory?._id || entry?.inventory || `${item._id}-${index}`,
    name: entry?.inventory?.name || "Unknown inventory item",
    quantity: Number(entry?.qtyPerOrder || 0),
    unit: entry?.unit || "",
    category: entry?.inventory?.category || null,
    type: entry?.inventory?.type || null,
    cost: Number(entry?.inventory?.cost || 0),
  }));
};

const getRecommendedAddOnEntries = (addOns = []) => {
  if (!Array.isArray(addOns)) return [];

  return addOns
    .map((addOn, index) => ({
      id: addOn?._id || `${index}-${addOn?.name || "addon"}`,
      name: addOn?.name || "Untitled add-on",
      price: Number(addOn?.price || 0),
      group: addOn?.group || "extras",
    }))
    .filter((entry) => entry.id);
};

const getCountLabel = (count, label) => {
  const base = count === 1 ? label.replace(/s$/, "") : label;
  return `${count} ${base}`;
};

const getManageLabel = (type) => {
  if (type === "bundle") return "Manage Bundle";
  if (type === "resell") return "Manage Stock Link";
  return "Manage Recipe";
};

const getSetupCtaLabel = (type) => {
  if (type === "bundle") return "Set up bundle";
  if (type === "resell") return "Link stock item";
  return "Create recipe";
};

const getSetupCtaDescription = (type) => {
  if (type === "bundle") return "Set up bundled items so it’s ready to sell.";
  if (type === "resell") return "Link a stock item so it’s ready to sell.";
  return "Create a recipe to sell & track this item.";
};

const getSetupNowLabel = (type) => {
  if (type === "bundle") return "Set up bundle now";
  if (type === "resell") return "Link stock now";
  return "Create recipe now";
};

const Body = () => {
  const { filtered, isLoading, formSubmitted } = useSelector(
    ({ menus }) => menus,
  );
  const { token } = useSelector(({ auth }) => auth);
  const { collections: categories = [] } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [cashierVisibility, setCashierVisibility] = useState({});
  const [openDetailId, setOpenDetailId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("details");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const dispatch = useDispatch();
  const hasFilteredResults = filtered.length > 0;

  const setDeleteDialogOpen = (value) => {
    setShowDeleteAlert(value);

    if (!value) {
      setDeleteTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?._id) {
      return;
    }

    try {
      await dispatch(
        DESTROY({ token, data: { _id: deleteTarget._id } }),
      ).unwrap();
      toast.success(`Deleted ${deleteTarget.name} successfully.`);
      setShowDeleteAlert(false);
      setDeleteTarget(null);
      setActiveMenuId(null);
      setOpenDetailId((current) =>
        current === deleteTarget._id ? null : current,
      );
    } catch (error) {
      toast.error(error?.message || error || "Failed to delete menu item.");
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {skeletonItems.map((item) => (
            <ItemSkeleton key={item} />
          ))}
        </div>
      ) : hasFilteredResults ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const isActionOpen = activeMenuId === item._id;
            const isCashierVisible =
              cashierVisibility[item._id] ?? item.isPublish;
            const detailEntries = getDetailEntries(item, categories);
            const recommendedEntries = getRecommendedAddOnEntries(
              item?.recommendedAddOns || [],
            );
            const typeMeta = getMenuTypeMeta(item.type);
            const TypeIcon = typeMeta.icon;
            const hasBreakdown = detailEntries.length > 0;
            const hasRecommendedAddOns = recommendedEntries.length > 0;
            const shouldEnableCollapse = hasBreakdown || hasRecommendedAddOns;
            const isDetailsOpen =
              shouldEnableCollapse && openDetailId === item._id;
            const isOverlayOpen = isDetailsOpen;

            return (
              <Collapsible
                key={item._id}
                open={shouldEnableCollapse ? isDetailsOpen : false}
                onOpenChange={(open) => {
                  if (!shouldEnableCollapse) return;
                  setOpenDetailId(open ? item._id : null);
                  setActiveDetailTab("details");
                }}
                className={`group relative transition-transform duration-300 hover:-translate-y-1 ${
                  isOverlayOpen ? "z-20" : ""
                }`}
              >
                <div
                  className={`relative flex h-full flex-col border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg ${
                    isDetailsOpen
                      ? "overflow-visible rounded-t-2xl rounded-b-none border-b-transparent shadow-sm"
                      : "rounded-2xl"
                  }`}
                >
                  <div className="relative h-52 overflow-hidden rounded-t-2xl bg-muted/40">
                    <img
                      src={
                        item?.imgId
                          ? Cloudinary.getMenuImg(item.imgId, item?._id)
                          : item.image
                      }
                      alt={item.name}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute top-2 flex w-full items-start justify-between gap-1.5 px-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCashierVisibility((current) => ({
                            ...current,
                            [item._id]: !isCashierVisible,
                          }))
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold shadow-md backdrop-blur-sm transition ${
                          isCashierVisible
                            ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                            : "border-white/30 bg-black/55 text-white"
                        }`}
                      >
                        <span>
                          {isCashierVisible ? "Available" : "Unavailable"}
                        </span>
                        <span
                          className={`relative h-3.5 w-6 rounded-full transition ${
                            isCashierVisible
                              ? "bg-emerald-500/90"
                              : "bg-white/30"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition ${
                              isCashierVisible ? "left-3" : "left-0.5"
                            }`}
                          />
                        </span>
                      </button>

                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          type="button"
                          title="Actions"
                          onClick={() =>
                            setActiveMenuId((current) =>
                              current === item._id ? null : item._id,
                            )
                          }
                          className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur-sm transition hover:bg-white"
                        >
                          <EllipsisVertical className="h-3 w-3" />
                        </button>

                        {isActionOpen && (
                          <>
                            <button
                              type="button"
                              onClick={() => dispatch(Set_SELECTED(item))}
                              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/90 text-primary shadow-md backdrop-blur-sm transition hover:bg-white"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(item);
                                setDeleteDialogOpen(true);
                              }}
                              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-red-500/90 text-white shadow-md backdrop-blur-sm transition hover:bg-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold text-white">
                          {item.name}
                        </h2>
                      </div>

                      <div className="rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-primary shadow">
                        {Formatter.amount(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>

                    {shouldEnableCollapse ? (
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setActiveDetailTab("details")}
                          className="mt-3 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/10 px-3 py-2.5 text-left transition hover:border-border hover:bg-muted/20"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                              <TypeIcon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {typeMeta.title}
                                {hasRecommendedAddOns ? " & Add-ons" : ""}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {hasBreakdown
                                  ? DETAIL_HINT_BY_TYPE[item.type]
                                  : EMPTY_STATE_BY_TYPE[item.type] ||
                                    EMPTY_STATE_BY_TYPE.prepared}
                                {hasRecommendedAddOns
                                  ? ` \u2022 ${recommendedEntries.length} add-ons`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {hasBreakdown && item.type !== "prepared" && (
                              <span className="rounded-full bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                                {capitalize(item.type)}
                              </span>
                            )}
                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                isDetailsOpen ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(Set_SELECTED({ item, mode: "setup" }))
                        }
                        className="mt-3 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-left transition hover:border-primary/30 hover:bg-primary/10"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TypeIcon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary">
                              {getSetupCtaLabel(item.type)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {getSetupCtaDescription(item.type)}
                            </p>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </button>
                    )}
                  </div>
                </div>

                {shouldEnableCollapse ? (
                  <CollapsibleContent className="absolute left-0 top-full z-30 mt-0 w-full overflow-hidden opacity-100 transition-opacity duration-200 ease-out data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
                    <div className="relative rounded-b-2xl border border-border border-t-0 bg-card p-3 shadow-none">
                      <div className="absolute inset-x-0 top-0 h-px bg-card" />
                      <div className="absolute inset-x-4 top-0 h-px bg-border/70" />

                      {hasRecommendedAddOns ? (
                        <div className="mb-3">
                          <div className="flex w-full max-w-full rounded-xl border border-border bg-background p-1">
                            <button
                              type="button"
                              onClick={() => setActiveDetailTab("details")}
                              className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${
                                activeDetailTab === "details"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              {typeMeta.title}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveDetailTab("addons")}
                              className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${
                                activeDetailTab === "addons"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              Add-ons ({recommendedEntries.length})
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {activeDetailTab === "addons" ? (
                        hasRecommendedAddOns ? (
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {recommendedEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {capitalize(entry.name)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {capitalize(entry.group)}
                                  </p>
                                </div>
                                <p className="shrink-0 text-sm font-semibold text-foreground">
                                  {Formatter.amount(entry.price)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-border bg-background/50 px-4 py-6 text-sm text-muted-foreground">
                            No recommended add-ons yet.
                          </div>
                        )
                      ) : hasBreakdown ? (
                        <>
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {item.type === "bundle"
                              ? detailEntries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {entry.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {entry.category || "Uncategorized"}
                                        {entry.type
                                          ? ` | ${capitalize(entry.type)}`
                                          : ""}
                                      </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-semibold text-foreground">
                                        x{entry.quantity}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {Formatter.amount(
                                          entry.price * entry.quantity,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              : detailEntries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                                  >
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {entry.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {entry.category
                                          ? capitalize(entry.category)
                                          : "Inventory item"}
                                        {entry.type
                                          ? ` | ${capitalize(entry.type)}`
                                          : ""}
                                      </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-semibold text-foreground">
                                        {entry.quantity} {entry.unit}
                                      </p>
                                      {item.type === "resell" && (
                                        <p className="text-xs text-muted-foreground">
                                          {Formatter.amount(entry.cost)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border bg-background/50 p-4">
                          <div className="min-w-0">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {EMPTY_CTA_BY_TYPE[item.type]?.title ||
                                  EMPTY_CTA_BY_TYPE.prepared.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {getSetupCtaDescription(item.type)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(Set_SELECTED({ item, mode: "setup" }))
                            }
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {getSetupNowLabel(item.type)}
                          </button>
                        </div>
                      )}

                      {(activeDetailTab === "addons" || hasBreakdown) && (
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                          <p className="text-[11px] text-muted-foreground">
                            {activeDetailTab === "addons"
                              ? getCountLabel(
                                  recommendedEntries.length,
                                  "add-ons",
                                )
                              : getCountLabel(
                                  detailEntries.length,
                                  typeMeta.summaryLabel,
                                )}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                Set_SELECTED({
                                  item,
                                  mode:
                                    activeDetailTab === "addons"
                                      ? "addons"
                                      : "setup",
                                }),
                              )
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {activeDetailTab === "addons"
                              ? "Manage Add-ons"
                              : getManageLabel(item.type)}
                          </button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                ) : null}
              </Collapsible>
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      <Confirmation
        isOpen={showDeleteAlert}
        onConfirm={handleDelete}
        onOpenChange={setDeleteDialogOpen}
        item={deleteTarget}
        formSubmitted={formSubmitted}
      />
    </>
  );
};

export default Body;
