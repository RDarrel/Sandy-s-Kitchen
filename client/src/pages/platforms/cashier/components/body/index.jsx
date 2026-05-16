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
import { CartAdd } from "@/services/redux/slices/stations/cashier";
import { createCartSignature } from "@/services/redux/slices/stations/cashier.utils";
import CashierBodyHeader from "./header";
import CashierNoResults from "./no-results";

const CashierBody = () => {
  const dispatch = useDispatch();

  const { menusFiltered = [], isLoading: menusLoading } = useSelector(
    ({ cashier }) => cashier,
  );
  const cart = useSelector(({ cashier }) => cashier?.cart);

  const cartLines = useMemo(() => {
    const lines = Array.isArray(cart?.lines) ? cart.lines : [];
    return lines
      .map((line) => ({
        ...line,
        id: String(line?.id || ""),
        menuId: String(line?.menuId || ""),
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

  const animateAddToOrder = (fromEl, menu, options = {}) => {
    try {
      if (typeof window === "undefined" || typeof document === "undefined")
        return Promise.resolve();
      if (!fromEl?.getBoundingClientRect) return Promise.resolve();
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
        return Promise.resolve();

      const cardEl = fromEl?.closest?.("[data-menu-card]") || null;
      const sourceEl = cardEl || fromEl;
      const fromRect = sourceEl.getBoundingClientRect();
      if (!fromRect || fromRect.width < 8 || fromRect.height < 8)
        return Promise.resolve();

      const fromX = fromRect.left + fromRect.width / 2;
      const fromY = fromRect.top + fromRect.height / 2;

      const overrideTargetEl = options?.targetEl || null;
      const targetAlign = options?.targetAlign || "center";
      if (overrideTargetEl?.scrollIntoView) {
        try {
          overrideTargetEl.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: "auto",
          });
        } catch {
          // ignore
        }
      }

      const fallbackCartButton = document.querySelector(
        "[data-cashier-cart-button]",
      );
      const primaryTargetEl = overrideTargetEl || fallbackCartButton;
      const targetRect = primaryTargetEl?.getBoundingClientRect?.();
      const useFallback =
        !targetRect ||
        targetRect.width < 8 ||
        targetRect.height < 8 ||
        targetRect.bottom < 0;
      const fallbackRect = fallbackCartButton?.getBoundingClientRect?.();
      const toRect = useFallback ? fallbackRect : targetRect;
      if (!toRect || toRect.width < 8 || toRect.height < 8)
        return Promise.resolve();

      const toX = toRect.left + toRect.width / 2;
      const toY =
        overrideTargetEl && !useFallback
          ? targetAlign === "top"
            ? toRect.top + Math.min(toRect.height * 0.18, 72)
            : toRect.top + toRect.height / 2
          : toRect.top + Math.min(toRect.height * 0.35, 120);

      const dx = toX - fromX;
      const dy = toY - fromY;

      const flyer = cardEl
        ? cardEl.cloneNode(true)
        : document.createElement("div");

      if (!cardEl) {
        flyer.className =
          "pointer-events-none fixed z-[60] w-[220px] select-none rounded-2xl border bg-background/95 shadow-lg backdrop-blur";
        flyer.innerHTML = `
          <div class="px-3 pt-2 text-xs font-semibold text-foreground">
            ${String(menu?.name || "Added item")
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")}
          </div>
          <div class="px-3 pb-2 text-[11px] font-semibold text-muted-foreground">
            ${String(Formatter.amount(Number(menu?.price) || 0))
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")}
          </div>
        `;
        flyer.style.left = `${fromX}px`;
        flyer.style.top = `${fromY}px`;
        flyer.style.transform = "translate(-50%, -50%)";
      } else {
        const computed = window.getComputedStyle(cardEl);
        flyer.style.position = "fixed";
        flyer.style.left = `${fromRect.left}px`;
        flyer.style.top = `${fromRect.top}px`;
        flyer.style.width = `${fromRect.width}px`;
        flyer.style.height = `${fromRect.height}px`;
        flyer.style.margin = "0";
        flyer.style.pointerEvents = "none";
        flyer.style.zIndex = "60";
        flyer.style.background = computed.backgroundColor;
        flyer.style.borderRadius = computed.borderRadius;
        flyer.style.overflow = "hidden";
        flyer.style.boxShadow =
          "0 18px 48px rgba(0,0,0,.18), 0 8px 18px rgba(0,0,0,.12)";
        flyer.style.transformOrigin = "center";
        flyer.style.willChange = "transform, opacity, filter";
      }

      document.body.appendChild(flyer);

      if (cardEl?.animate) {
        cardEl.animate(
          [
            { transform: "translate3d(0,0,0) scale(1)" },
            { transform: "translate3d(0,0,0) scale(0.985)" },
            { transform: "translate3d(0,0,0) scale(1)" },
          ],
          { duration: 160, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" },
        );
      }

      const duration = 650;
      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

      const midX = dx * 0.7;
      const midY = dy * 0.7;

      const start = cardEl
        ? "translate3d(0px, 0px, 0) scale(1) rotate(0deg)"
        : "translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1) rotate(0deg)";
      const mid = cardEl
        ? `translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`
        : `translate(-50%, -50%) translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`;
      const end = cardEl
        ? `translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`
        : `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`;

      const anim = flyer.animate(
        [
          { transform: start, opacity: 1 },
          { transform: mid, opacity: 1, offset: 0.6 },
          { transform: end, opacity: 1, offset: 0.9 },
          { transform: end, opacity: 0, offset: 1 },
        ],
        { duration, easing, fill: "both" },
      );

      const cleanup = () => flyer.remove();

      const arrivalMs = Math.max(0, Math.round(duration * 0.55));
      let resolved = false;
      let timer = null;
      let resolveArrival = null;

      const arrivalPromise = new Promise((resolve) => {
        resolveArrival = () => {
          if (resolved) return;
          resolved = true;
          resolve();
        };
        timer = window.setTimeout(resolveArrival, arrivalMs);
      });

      anim.onfinish = () => {
        if (timer) window.clearTimeout(timer);
        resolveArrival?.();
        cleanup();
      };
      anim.oncancel = () => {
        if (timer) window.clearTimeout(timer);
        resolveArrival?.();
        cleanup();
      };

      return arrivalPromise;
    } catch {
      // ignore animation errors
    }

    return Promise.resolve();
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

              return (
                <MenuCard
                  key={menuId}
                  menu={menu}
                  quantity={quantity}
                  imageSrc={imageSrc}
                  onAdd={async (e) => {
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

                    await animateAddToOrder(e?.currentTarget, menu, {
                      targetEl,
                      targetAlign: isNewLine ? "top" : "center",
                    });
                    dispatch(CartAdd({ menuId, addOns: [] }));
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
  const hasAddOns =
    Array.isArray(menu?.recommendedAddOns) && menu.recommendedAddOns.length > 0;
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

        {hasAddOns && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 rounded-full bg-background/90 text-foreground shadow-sm"
          >
            {menu.recommendedAddOns.length} add-on(s)
          </Badge>
        )}

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
