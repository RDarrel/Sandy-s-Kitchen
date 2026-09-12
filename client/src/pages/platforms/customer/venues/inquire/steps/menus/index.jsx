import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const MenuSelection = ({
  type,
  categories = [],
  selections,
  onToggle = () => {},
}) => {
  console.log("categories", categories);
  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No menu choices are available for this package yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {categories.map((option) => {
        const { category } = option;
        const categoryId = category?._id;
        const selectedIds = selections[categoryId] || [];
        const categoryLimit = option?.limit;
        const choices = option?.choices || [];

        return (
          <div
            key={categoryId}
            className="overflow-hidden rounded-lg border bg-background"
          >
            <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  {category?.name}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {selectedIds.length}/{categoryLimit} selected
                </p>
              </div>

              <Badge
                variant="outline"
                className="rounded-full px-2 py-0.5 text-[10px]"
              >
                {categoryLimit === 1 ? "Choose 1" : `Choose ${categoryLimit}`}
              </Badge>
            </div>

            <div className="grid gap-1 p-2 sm:grid-cols-2">
              {choices.map((menu) => {
                const menuId = menu?._id;
                const checked = selectedIds.includes(menuId);

                return (
                  <label
                    key={menuId}
                    className={cn(
                      "flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors",
                      checked
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-transparent hover:border-primary/15 hover:bg-primary/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onToggle(type, category, menu, option.limit)
                      }
                      className="size-3.5 shrink-0 accent-primary"
                    />
                    <span className="leading-4">{menu?.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MenuSectionHeader = ({ icon, title, count, limit }) => {
  const IconComponent = icon;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <IconComponent className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
        {count}/{limit}
      </Badge>
    </div>
  );
};
