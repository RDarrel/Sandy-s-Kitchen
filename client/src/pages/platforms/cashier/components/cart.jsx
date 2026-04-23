import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChefHat,
  Layers3,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CartClear,
  CartDecrement,
  CartIncrement,
  CartRemove,
  SetCartOpen,
  SetCustomSelected,
  SetCustomizeState,
} from "@/services/redux/slices/stations/cashier";

const fixedSectionGap = 16;

const CashierCart = () => {
  const dispatch = useDispatch();
  const { cartOpen, cart } = useSelector(({ cashier }) => cashier);
  const { collections: menusCollections = [] } = useSelector(({ menus }) => menus);

  const menuById = useMemo(() => {
    const map = new Map();
    for (const item of Array.isArray(menusCollections) ? menusCollections : []) {
      if (item?._id) map.set(String(item._id), item);
    }
    return map;
  }, [menusCollections]);

  const cartLines = useMemo(() => {
    const lines = Array.isArray(cart?.lines) ? cart.lines : [];
    return lines
      .map((line) => ({
        ...line,
        id: String(line?.id || ""),
        menuId: String(line?.menuId || ""),
        quantity: Math.max(0, Number(line?.quantity) || 0),
        addOns: Array.isArray(line?.addOns) ? line.addOns : [],
        signature: String(line?.signature || ""),
        updatedAt: Number(line?.updatedAt) || 0,
        addedAt: Number(line?.addedAt) || 0,
      }))
      .filter((line) => line.id && line.menuId && line.quantity > 0);
  }, [cart]);

  const cartEntries = useMemo(() => {
    return cartLines
      .map((line) => {
        const menu = menuById.get(String(line.menuId));
        if (!menu) return null;
        return { line, menu };
      })
      .filter(Boolean);
  }, [cartLines, menuById]);

  const cartTotals = useMemo(() => {
    const totalItems = cartEntries.reduce(
      (sum, entry) => sum + (entry?.line?.quantity || 0),
      0,
    );
    const totalAmount = cartEntries.reduce((sum, entry) => {
      const base = Number(entry?.menu?.price) || 0;
      const addOnsTotal = (entry?.line?.addOns || []).reduce(
        (innerSum, addOn) => innerSum + (Number(addOn?.price) || 0),
        0,
      );
      return sum + (base + addOnsTotal) * (entry?.line?.quantity || 0);
    }, 0);
    return { totalItems, totalAmount };
  }, [cartEntries]);

  const openCustomizeForLine = useCallback(
    (line) => {
      const lineId = String(line?.id || "");
      const menuId = String(line?.menuId || "");
      if (!lineId || !menuId) return;

      dispatch(
        SetCustomSelected(
          (line?.addOns || [])
            .map((item) => String(item?._id || ""))
            .filter(Boolean),
        ),
      );
      dispatch(SetCustomizeState({ mode: "edit", menuId, lineId }));
    },
    [dispatch],
  );

  return (
    <aside className="min-w-0">
      <Sheet open={cartOpen} onOpenChange={(next) => dispatch(SetCartOpen(next))}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="pb-2">
            <SheetTitle>Current order</SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex h-[calc(100dvh-5rem)] min-h-0 flex-col">
            <CartHeader
              hasItems={Boolean(cartEntries.length)}
              onClear={() => dispatch(CartClear())}
            />
            <Separator />
            <div className="flex-1 min-h-0 p-4">
              <CartPanel
                entries={cartEntries}
                totals={cartTotals}
                onIncrement={(lineId) => dispatch(CartIncrement(lineId))}
                onDecrement={(lineId) => dispatch(CartDecrement(lineId))}
                onRemove={(lineId) => dispatch(CartRemove(lineId))}
                onCustomize={openCustomizeForLine}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <div
          className="relative"
          style={{ height: "calc(100dvh - var(--cashier-topbar-height, 92px))" }}
        >
          <div
            data-cashier-order-panel
            className="fixed right-[max(1.5rem,calc((100vw-1536px)/2+1.5rem))] z-20 flex w-[380px] flex-col rounded-2xl border bg-card shadow-sm"
            style={{
              top: `calc(var(--cashier-topbar-height, 92px) + ${fixedSectionGap}px)`,
              height: `calc(100dvh - (var(--cashier-topbar-height, 92px) + ${fixedSectionGap}px) - 1.5rem)`,
            }}
          >
            <CartHeader
              hasItems={Boolean(cartEntries.length)}
              onClear={() => dispatch(CartClear())}
            />
            <Separator />
            <div className="flex-1 min-h-0 p-4">
              <CartPanel
                entries={cartEntries}
                totals={cartTotals}
                onIncrement={(lineId) => dispatch(CartIncrement(lineId))}
                onDecrement={(lineId) => dispatch(CartDecrement(lineId))}
                onRemove={(lineId) => dispatch(CartRemove(lineId))}
                onCustomize={openCustomizeForLine}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const CartHeader = ({ hasItems, onClear }) => {
  return (
    <div className="flex items-center justify-between gap-2 p-4">
      <div>
        <p className="text-sm font-semibold">Current order</p>
        <p className="text-xs text-muted-foreground">
          {hasItems ? "Review items before checkout." : "No items yet."}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-9 rounded-xl"
        disabled={!hasItems}
        onClick={onClear}
      >
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
};

const CartPanel = ({ entries, totals, onIncrement, onDecrement, onRemove, onCustomize }) => {
  const animatedByLineIdRef = useRef(new Map());

  const animateLineEl = useCallback((el, lineId, stamp) => {
    if (!el) return;
    if (!stamp) return;

    const lastAnimated = animatedByLineIdRef.current.get(lineId);
    if (lastAnimated === stamp) return;
    animatedByLineIdRef.current.set(lineId, stamp);

    try {
      if (typeof window !== "undefined") {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")
          ?.matches;
        if (reduce) return;
      }

      el.animate(
        [
          { transform: "translate3d(0,-10px,0) scale(0.985)", opacity: 0.6 },
          { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    } catch {
      // ignore animation errors
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div
        data-cashier-cart-list
        className="min-h-0 flex-1 space-y-2 overflow-auto pr-1"
      >
        {entries.length ? (
          entries.map(({ menu, line }) => {
            const lineId = String(line?.id || "");
            const price = Number(menu?.price) || 0;
            const addOnsTotal = (line?.addOns || []).reduce(
              (sum, addOn) => sum + (Number(addOn?.price) || 0),
              0,
            );
            const unitTotal = price + addOnsTotal;
            const lineTotal = unitTotal * (line?.quantity || 0);
            const imageSrc = menu?.imgId
              ? Cloudinary.getMenuImg(menu.imgId, menu?._id)
              : menu?.image || null;
            const addOnNames = (line?.addOns || [])
              .map((item) => item?.name)
              .filter(Boolean);

            return (
              <div
                data-cart-line-id={lineId}
                ref={(el) =>
                  animateLineEl(
                    el,
                    lineId,
                    Number(line?.attentionAt) || Number(line?.addedAt) || 0,
                  )
                }
                key={lineId}
                className="rounded-xl border bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted/40">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={menu?.name || "Menu image"}
                          className="h-full w-full object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ChefHat className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="min-w-0 truncate text-sm font-semibold">
                        {menu?.name}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-muted-foreground">
                        {Formatter.amount(unitTotal)}
                      </p>
                      {addOnNames.length ? (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                          + {addOnNames.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl"
                    onClick={() => onRemove?.(lineId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const hasAddOns = Boolean(
                        Array.isArray(menu?.recommendedAddOns) &&
                          menu.recommendedAddOns.length,
                      );
                      const tooltip = hasAddOns ? "Add-ons" : "No add-ons available";

                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={`inline-flex ${hasAddOns ? "" : "cursor-not-allowed"}`}>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl"
                                aria-label={tooltip}
                                disabled={!hasAddOns}
                                onClick={() => onCustomize?.(line)}
                              >
                                <Layers3 className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            {tooltip}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })()}

                    <div className="flex items-center gap-1 rounded-xl border bg-background px-1 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onDecrement?.(lineId)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {line?.quantity || 0}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => onIncrement?.(lineId)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-bold">
                    {Formatter.amount(lineTotal)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed bg-background/40 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold">Cart is empty</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
              Tap any menu card to add items.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border bg-background/40 p-4">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="text-base font-bold">
            {Formatter.amount(totals.totalAmount || 0)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {totals.totalItems || 0} item{(totals.totalItems || 0) === 1 ? "" : "s"}{" "}
          in cart
        </p>
        <Button
          type="button"
          className="mt-3 h-10 w-full rounded-xl"
          disabled={!entries.length}
          onClick={() => {
            // UI-ready; backend order flow can be wired later.
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CashierCart;
