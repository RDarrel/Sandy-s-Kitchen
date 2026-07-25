import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { capitalize } from "lodash";
import { Check, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Empty as EmptyState } from "./components";
import Inclusion from "./inclusion";

const Cluster = ({
  title,
  subtitle,
  addTitle,
  detailsTitle,
  icon,
  items = [],
  included = [],
  type = "equipment",
  searchPlaceholder = "Search",
  emptyTitle = "No items found",
  setForm = () => {},
}) => {
  const [search, setSearch] = useState("");
  const selectedIds = useMemo(
    () => new Set(included?.map(({ item }) => item?._id)),
    [included],
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, search]);

  const toggleItem = useCallback((inclusion, type) => {
    setForm((prev) => {
      const inclusions = [...prev.inclusions];
      const index = inclusions.findIndex(
        ({ item }) => inclusion?._id === item?._id,
      );
      if (index > -1) {
        inclusions.splice(index, 1);
      } else {
        inclusions.unshift({
          item: inclusion,
          amount: 0,
          unit: inclusion?.requirement || "qty",
          model: type,
        });
      }
      return { ...prev, inclusions };
    });
  }, []);

  const updateSelectedItem = useCallback((itemId, value) => {
    setForm((prev) => {
      const inclusions = [...prev.inclusions];
      const index = inclusions.findIndex(({ item }) => itemId === item?._id);
      if (index < 0) return prev;
      inclusions[index] = {
        ...inclusions[index],
        amount: Number(value),
      };
      return { ...prev, inclusions };
    });
  }, []);
  return (
    <section className="flex h-full flex-col rounded-[7px] border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-4 text-foreground">
              {title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {subtitle}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-full">
          {included.length} selected
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
        <div className="shrink-0 overflow-hidden rounded-md border border-border bg-background">
          <div className="grid gap-2 border-b p-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
            <p className="text-xs font-semibold text-foreground">{addTitle}</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1.5 size-4 text-muted-foreground" />
              <Input
                className="h-7 pl-8 text-xs"
                value={search}
                onChange={({ target }) => setSearch(target.value)}
                placeholder={searchPlaceholder}
                type={"search"}
              />
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {filteredItems.length} items
            </span>
          </div>

          <div className="h-24 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
            {filteredItems.length > 0 ? (
              <div className="divide-y">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item?._id);

                  return (
                    <button
                      key={item?._id || item?.name}
                      type="button"
                      onClick={() => toggleItem(item, type)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-muted/25"
                      }`}
                    >
                      <span className="min-w-0 truncate text-xs font-medium">
                        {capitalize(item?.name || "")}
                      </span>
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${
                          isSelected
                            ? "border-primary/20 bg-primary/10"
                            : "border-border bg-card"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Plus className="size-3.5 text-primary" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState title={emptyTitle} />
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-primary/25 bg-primary/5">
          <div className="flex items-center justify-between gap-2 border-b border-primary/20 bg-[color:color-mix(in_srgb,var(--color-primary)_8%,white)] px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
              <p className="text-xs font-semibold text-foreground">
                {detailsTitle}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {included.length}
            </Badge>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent lg:max-h-48">
            {included.length > 0 ? (
              <div>
                {included.map(({ item, amount }) => (
                  <Inclusion
                    key={`Inclusion-${item?._id}`}
                    item={item}
                    value={amount}
                    type={type}
                    toggleItem={toggleItem}
                    updateSelectedItem={updateSelectedItem}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${title.toLowerCase()} included`}
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cluster;
