import { Badge } from "@/components/ui/badge";
import {
  Frame,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@/components/reui/frame";
import { cn } from "@/lib/utils";

export const MenuSelection = ({
  type,
  categories = [],
  selections = {},
  onToggle = () => {},
}) => {
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center">
        <p className="text-xs text-muted-foreground">
          No menu choices are available for this package yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {categories.map((option) => {
        const { category } = option;

        const categoryId = category?._id;
        const categoryLimit = option?.limit || 0;
        const choices = option?.choices || [];
        const selectedIds = selections?.[categoryId] || [];

        const selectedCount = selectedIds.length;

        return (
          <Frame
            key={categoryId}
            spacing="xs"
            className="overflow-hidden rounded-lg border-border bg-background"
          >
            {/* Category header */}
            <FrameHeader className="flex-row items-center justify-between gap-3 bg-muted/15 px-3 py-2">
              <FrameTitle className="min-w-0 truncate text-sm font-medium">
                {category?.name}
              </FrameTitle>

              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {selectedCount}/{categoryLimit} selected
              </Badge>
            </FrameHeader>

            {/* Menu choices */}
            <FramePanel className="p-1.5">
              <div className="grid gap-0.5 sm:grid-cols-2">
                {choices.map((menu) => {
                  const menuId = menu?._id;
                  const checked = selectedIds.includes(menuId);

                  return (
                    <label
                      key={menuId}
                      className={cn(
                        "flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors",
                        checked
                          ? "bg-primary/[0.035] text-foreground"
                          : "text-foreground hover:bg-muted/40",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          onToggle(type, category, menu, categoryLimit)
                        }
                        className="size-3.5 shrink-0 cursor-pointer accent-primary"
                      />

                      <span className="min-w-0 leading-4">{menu?.name}</span>
                    </label>
                  );
                })}
              </div>
            </FramePanel>
          </Frame>
        );
      })}
    </div>
  );
};
