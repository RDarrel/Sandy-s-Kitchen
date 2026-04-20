import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterBY_CATEGORY,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/menu/menus";
const Header = () => {
  const {
    category: actCategory,
    search,
    collections,
    isLoading,
  } = useSelector(({ menus }) => menus);
  const { collections: categories } = useSelector(
    ({ menuCategories }) => menuCategories,
  );
  const dispatch = useDispatch();
  const totalMenus = collections.length;
  const categoryCounts = categories.reduce((accumulator, category) => {
    accumulator[category._id] = collections.filter(
      (item) => item.category === category._id,
    ).length;
    return accumulator;
  }, {});

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold leading-tight">
                Menu Items
              </h1>
              {totalMenus > 0 && (
                <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {totalMenus} total
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your restaurant items, stock, and publish readiness.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:w-[250px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => dispatch(SEARCH(e.target.value))}
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => dispatch(SetCREATE())}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {isLoading
          ? new Array(7)
              .fill("")
              .map((_, index) => (
                <Skeleton
                  key={index}
                  className={`h-10 shrink-0 rounded-full ${
                    index === 0 ? "w-16" : "w-24"
                  }`}
                />
              ))
          : [{ _id: "all", name: "All" }, ...(categories || [])].map(
              (category, index) => {
                const isActive = actCategory === category?._id;
                const categoryCount = categoryCounts[category?._id];

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => dispatch(FilterBY_CATEGORY(category?._id))}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span>{category.name}</span>
                    {category?._id !== "all" && categoryCount > 0 && (
                      <span
                        className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isActive
                            ? "bg-primary-foreground/15 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {categoryCount}
                      </span>
                    )}
                  </button>
                );
              },
            )}
      </div>
    </div>
  );
};

export default Header;
