import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { capitalize } from "lodash";
import { ListChecks, PackageCheck, Trash2, Utensils } from "lucide-react";
import { useMemo } from "react";

const Step4 = ({ mainCourses: menus = [], setSelectedMenus = () => {} }) => {
  const groupedMenus = useMemo(() => {
    if (menus.length === 0) return [];
    return menus.reduce((acc, curr) => {
      const { category } = curr;
      const key = category.name;
      if (!acc[key]) {
        acc[key] = [curr];
      } else {
        acc[key].push(curr);
      }
      return acc;
    }, {});
  }, [menus]);

  const updateQtyServe = (menuId, qtyServe) => {
    setSelectedMenus((prev) =>
      prev.map((menu) =>
        menu._id === menuId
          ? {
              ...menu,
              qtyServe,
            }
          : menu,
      ),
    );
  };

  const removeSelectedMenu = (menuId) => {
    setSelectedMenus((prev) => prev.filter(({ _id }) => _id !== menuId));
  };

  return (
    <div className="rounded-[7px] border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PackageCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Selected menus
            </p>
            <p className="text-xs text-muted-foreground">
              Review selected dishes and set serving quantity.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
          <ListChecks className="mr-1 size-3.5" />
          {menus.length} selected
        </Badge>
      </div>

      {menus.length === 0 ? (
        <div className="flex min-h-36 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-md border border-dashed bg-muted/30 text-muted-foreground">
            <Utensils className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              No menus selected yet
            </p>
            <p className="text-xs text-muted-foreground">
              Choose menus above to build this package.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {Object.entries(groupedMenus).map(([category, _menus]) => (
            <div
              key={category}
              className="rounded-md border border-border bg-background"
            >
              <div className="flex items-center justify-between gap-3 border-b px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {capitalize(category)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Set servings for each selected dish.
                  </p>
                </div>

                <Badge variant="outline" className="shrink-0 rounded-full">
                  {_menus.length} {_menus.length > 1 ? "menus" : "menu"}
                </Badge>
              </div>

              <div className="divide-y">
                {_menus.map((menu, idx) => (
                  <div
                    key={menu?._id || `${category}-${idx}`}
                    className="grid grid-cols-[minmax(0,1fr)_7rem_2rem] items-center gap-3 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {capitalize(menu?.name || "")}
                        </p>
                        {menu?.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {menu.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-right text-[11px] font-medium text-muted-foreground">
                        Qty Serve
                      </p>
                      <Input
                        type="number"
                        min="1"
                        value={menu?.qtyServe || ""}
                        onChange={({ target }) =>
                          updateQtyServe(menu._id, target.value)
                        }
                        placeholder="0"
                        className="h-8 text-right"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSelectedMenu(menu._id)}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${menu?.name || "menu"}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step4;
