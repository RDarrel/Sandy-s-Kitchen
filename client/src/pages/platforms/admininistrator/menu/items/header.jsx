import { Category } from "@/services/fakeDB";
import { UtensilsCrossed, Search, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  FilterBY_CATEGORY,
  SEARCH,
  SetCREATE,
} from "@/services/redux/slices/menu/menu";
const Header = () => {
  const { category: actCategory, search } = useSelector(({ menu }) => menu);
  const dispatch = useDispatch();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UtensilsCrossed className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-xl font-semibold leading-tight">Menu Items</h1>
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

      <div className="mt-4 flex flex-wrap gap-2">
        {[{ value: "all", name: "All" }, ...Category.collections].map(
          (category, index) => {
            const isActive = actCategory === category.value;
            return (
              <button
                key={index}
                type="button"
                onClick={() => dispatch(FilterBY_CATEGORY(category.value))}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {category.name}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
};

export default Header;
