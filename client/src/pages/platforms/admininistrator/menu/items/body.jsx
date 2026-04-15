import Cloudinary from "@/services/utilities/cloudinary";
import {
  Pencil,
  Trash2,
  UtensilsCrossed,
  Package2,
  ChefHat,
  BadgeCheck,
  FileWarning,
} from "lucide-react";
import { useSelector } from "react-redux";
const Body = () => {
  const { filtered } = useSelector(({ menu }) => menu);
  const getStockMeta = (stock = 0) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-600 border-red-200",
        icon: Package2,
      };
    }

    if (stock <= 5) {
      return {
        label: `Low Stock (${stock})`,
        className: "bg-amber-50 text-amber-600 border-amber-200",
        icon: Package2,
      };
    }

    return {
      label: `In Stock (${stock})`,
      className: "bg-green-50 text-green-600 border-green-200",
      icon: Package2,
    };
  };

  const getPublishMeta = (item) => {
    if (item.category === "Resell") {
      return {
        label: item.isPublish ? "Published" : "Hidden",
        className: item.isPublish
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-slate-100 text-slate-600 border-slate-200",
        icon: BadgeCheck,
        helper: item.isPublish
          ? "Ready for selling"
          : "Not visible for selling yet",
      };
    }

    if (!item.hasRecipe) {
      return {
        label: "Needs Recipe",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: FileWarning,
        helper: "Chef needs to add a recipe first",
      };
    }

    if (!item.isPublish) {
      return {
        label: "Pending Chef Approval",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: ChefHat,
        helper: item.chefApprovedBy
          ? `Draft only • Last handled by ${item.chefApprovedBy}`
          : "Recipe exists but not published yet",
      };
    }

    return {
      label: "Published",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: BadgeCheck,
      helper: item.chefApprovedBy
        ? `Approved by ${item.chefApprovedBy}`
        : "Ready for selling",
    };
  };
  return (
    <>
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const stockMeta = getStockMeta(item.stock);
            const publishMeta = getPublishMeta(item);
            const PublishIcon = publishMeta.icon;
            const StockIcon = stockMeta.icon;

            return (
              <div
                key={item._id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      item?.imgId
                        ? Cloudinary.getMenuImg(item.imgId, item?._id)
                        : item.image
                    }
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow">
                      {item.category}
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

                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-lg font-semibold">No menu items found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No results matched your current filter or search.
          </p>
        </div>
      )}
    </>
  );
};

export default Body;
