import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChefHat, Info } from "lucide-react";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CartAdd,
  SetCustomSelected,
  SetCustomizeState,
} from "@/services/redux/slices/stations/cashier";
import { createCartSignature } from "@/services/redux/slices/stations/cashier.utils";
import CashierBodyHeader from "./header";
import CashierNoResults from "./no-results";
import animateAddToOrder from "../../utils/animate-add-to-order";

const CashierBody = () => {
  const dispatch = useDispatch();

  const { menusFiltered = [], isLoading: menusLoading } = useSelector(
    ({ cashier }) => cashier,
  );
  const cart = useSelector(({ cashier }) => cashier?.cart);

  const cartLines = useMemo(() => {
    const lines = Array.isArray(cart) ? cart : [];
    return lines
      .map((line) => ({
        ...line,
        id: String(line?.id || ""),
        menuId: String(line?.menuId || line?.menu?._id || ""),
        quantity: Math.max(0, Number(line?.quantity) || 0),
        signature: String(line?.signature || ""),
      }))
      .filter((line) => line.id && line.menuId && line.quantity > 0);
  }, [cart]);

  const quantityByMenuId = useMemo(() => {
    const map = new Map();
    for (const line of cartLines) {
      map.set(line.menuId, (map.get(line.menuId) || 0) + line.quantity);
    }
    return map;
  }, [cartLines]);

  const getMenuImgSrc = (menu) => {
    if (menu?.imgId) return Cloudinary.getMenuImg(menu.imgId, menu?._id);
    if (menu?.image) return menu.image;
    return null;
  };

  return (
    <section className="min-w-0">
      <CashierBodyHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {menusLoading
          ? new Array(12).fill(null).map((_, index) => (
              <Card
                key={index}
                className="gap-0 overflow-hidden rounded-xl py-0 shadow-sm"
              >
                <Skeleton className="h-40 w-full rounded-b-md" />
                <div className="p-4 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </Card>
            ))
          : menusFiltered.map((menu) => {
              const menuId = String(menu?._id || "");
              const quantity = quantityByMenuId.get(menuId) || 0;
              const imageSrc = getMenuImgSrc(menu);
              const hasAddOns =
                Array.isArray(menu?.recommendedAddOns) &&
                menu.recommendedAddOns.length > 0;

              return (
                <MenuCard
                  key={menuId}
                  menu={menu}
                  quantity={quantity}
                  imageSrc={imageSrc}
                  onAdd={async (e) => {
                    if (hasAddOns) {
                      try {
                        const rect =
                          e?.currentTarget?.getBoundingClientRect?.();
                        if (rect) {
                          dispatch(SetCustomSelected([]));
                          dispatch(
                            SetCustomizeState({
                              mode: "add",
                              menuId,
                              sourceMenuId: menuId,
                              fromPoint: {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2,
                              },
                            }),
                          );
                          return;
                        }
                      } catch {
                        // ignore
                      }

                      dispatch(SetCustomSelected([]));
                      dispatch(
                        SetCustomizeState({
                          mode: "add",
                          menuId,
                          sourceMenuId: menuId,
                        }),
                      );
                      return;
                    }

                    const signature = createCartSignature(menuId, []);
                    const existingLineId =
                      cartLines.find(
                        (line) => String(line?.signature || "") === signature,
                      )?.id || "";
                    const isNewLine = !existingLineId;
                    const orderPanel = document.querySelector(
                      "[data-cashier-order-panel]",
                    );
                    const cartButton = document.querySelector(
                      "[data-cashier-cart-button]",
                    );
                    const cartList = document.querySelector(
                      "[data-cashier-cart-list]",
                    );
                    const targetLineEl = existingLineId
                      ? document.querySelector(
                          `[data-cart-line-id="${String(existingLineId).replaceAll('"', '\\"')}"]`,
                        )
                      : null;

                    if (existingLineId) {
                      try {
                        targetLineEl?.scrollIntoView?.({
                          block: "center",
                          inline: "nearest",
                          behavior: "auto",
                        });
                      } catch {
                        // ignore
                      }
                    }

                    const targetEl = isNewLine
                      ? cartList || orderPanel || cartButton || null
                      : targetLineEl ||
                        cartList ||
                        orderPanel ||
                        cartButton ||
                        null;

                    if (isNewLine && cartList) {
                      try {
                        cartList.scrollTo?.({ top: 0, behavior: "auto" });
                      } catch {
                        try {
                          cartList.scrollTop = 0;
                        } catch {
                          // ignore
                        }
                      }
                    }

                    await animateAddToOrder(e?.currentTarget, menu, {
                      targetEl,
                      targetAlign: isNewLine ? "top" : "center",
                    });
                    dispatch(CartAdd({ menu, addOns: [] }));
                  }}
                />
              );
            })}
        {!menusLoading && (!menusFiltered || menusFiltered.length === 0) ? (
          <CashierNoResults />
        ) : null}
      </div>
    </section>
  );
};

const MenuCard = ({ menu, quantity, imageSrc, onAdd }) => {
  const isAvailable = true;

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
      onClick={onAdd}
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
                Includes {bundleCount} item{bundleCount === 1 ? "" : "s"}
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
                {menu?.name || "—"}
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

export default CashierBody;
