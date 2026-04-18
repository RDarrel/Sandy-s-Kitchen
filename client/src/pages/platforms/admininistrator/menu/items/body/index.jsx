import Cloudinary from "@/services/utilities/cloudinary";
import { Pencil, Trash2, EllipsisVertical } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Category } from "@/services/fakeDB";
import { DESTROY, Set_SELECTED } from "@/services/redux/slices/menu/menus";
import ItemSkeleton from "./item-skeleton";
import EmptyState from "./empty-state";
import Feature from "./feature";
import Confirmation from "./confirmation";
import { toast } from "sonner";

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

const Body = () => {
  const { filtered, isLoading, formSubmitted } = useSelector(
    ({ menus }) => menus,
  );
  const { token } = useSelector(({ auth }) => auth);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [cashierVisibility, setCashierVisibility] = useState({});
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
            const stockMeta = Feature.getStockMeta(item.stock);
            const publishMeta = Feature.getPublishMeta(item);
            const PublishIcon = publishMeta.icon;
            const StockIcon = stockMeta.icon;
            const isActionOpen = activeMenuId === item._id;
            const isCashierVisible =
              cashierVisibility[item._id] ?? item.isPublish;

            return (
              <div
                key={item._id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden bg-muted/40">
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

                  <div className="absolute right-3 top-3 flex items-start gap-1.5">
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
                        {isCashierVisible ? "Selling" : "Not Selling"}
                      </span>
                      <span
                        className={`relative h-3.5 w-6 rounded-full transition ${
                          isCashierVisible ? "bg-emerald-500/90" : "bg-white/30"
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

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow">
                      {Category.getName(item.category)}
                    </span>

                    {!item.isPublish && item.category !== "Resell" && (
                      <span className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white shadow">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-white">
                        {item.name}
                      </h2>
                    </div>

                    <div className="rounded-xl bg-white/90 px-3 py-2 text-sm font-bold text-primary shadow">
                      ₱{item.price}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-start gap-2">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${stockMeta.className}`}
                    >
                      <StockIcon className="h-3.5 w-3.5" />
                      {stockMeta.label}
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${publishMeta.className}`}
                    >
                      <PublishIcon className="h-3.5 w-3.5" />
                      {publishMeta.label}
                    </div>
                  </div>

                  <p className="mt-3 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
                    {publishMeta.helper}
                  </p>
                </div>
              </div>
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
