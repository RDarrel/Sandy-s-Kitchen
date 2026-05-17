import { Formatter, capitalize } from "@/services/utilities";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChefHat, Info } from "lucide-react";
const MenuCard = ({ menu, quantity, imageSrc, onAdd }) => {
  const isAvailable = menu?.isAvailable ?? menu?.isPublish;
  const bundleItems = Array.isArray(menu?.bundleItems) ? menu.bundleItems : [];
  const bundleCount = bundleItems.length;
  const hasBundle = (menu?.type || "") === "bundle" && bundleCount > 0;
  const price = Number(menu?.price) || 0;
  const description = String(menu?.description || "").trim();
  const hasDescription = Boolean(description);

  return (
    <Card
      data-menu-card
      data-menu-id={String(menu?._id || "")}
      role="button"
      tabIndex={0}
      aria-label={`Add ${menu?.name || "menu item"} to current order`}
      onClick={isAvailable ? onAdd : () => {}}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdd?.(e);
        }
      }}
      className="group cursor-pointer select-none gap-0 overflow-hidden rounded-xl py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="relative h-40 overflow-hidden rounded-t-xl rounded-b-md bg-muted/40">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={menu?.name || "Menu image"}
            className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              isAvailable ? "" : "opacity-70 grayscale-[15%]"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/60 to-muted/40">
            <ChefHat className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {quantity > 0 && (
          <Badge
            variant="secondary"
            className="absolute left-2 top-2 rounded-full bg-background/90 text-foreground shadow-sm"
          >
            {quantity} in cart
          </Badge>
        )}

        {hasBundle ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="absolute bottom-2 left-2 rounded-full bg-background/90 text-foreground shadow-sm"
              >
                {bundleCount} item{bundleCount === 1 ? "" : "s"} Included
              </Badge>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              sideOffset={6}
              className="max-w-[260px]"
            >
              <div className="space-y-1">
                {bundleItems.map((item, index) => {
                  const name = String(item?.name || "").trim();
                  if (!name) return null;
                  return (
                    <p key={String(item?._id || item?.id || index)}>
                      {index + 1}. {name}
                    </p>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : null}

        {!isAvailable && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 rounded-full bg-background/90 text-foreground shadow-sm"
          >
            Unavailable
          </Badge>
        )}
      </div>

      <div className="p-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 truncate text-sm font-semibold">
                {capitalize(menu?.name) || "—"}
              </p>
              {hasDescription ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Menu description"
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center leading-none text-muted-foreground/60 transition hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    sideOffset={2}
                    className="max-w-[280px]"
                  >
                    <p className="whitespace-normal text-xs leading-5">
                      {description}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
          <p className="shrink-0 text-sm font-bold">
            {Formatter.amount(price)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MenuCard;
