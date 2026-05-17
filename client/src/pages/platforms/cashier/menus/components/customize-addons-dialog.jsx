import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CartAdd,
  CartUpdateLineAddOns,
  SetCustomSelected,
  SetCustomizeState,
} from "@/services/redux/slices/stations/cashier";
import { createCartSignature } from "@/services/redux/slices/stations/cashier.utils";
import animateAddToOrder from "../utils/animate-add-to-order";

const CashierCustomizeAddOnsDialog = () => {
  const dispatch = useDispatch();
  const { customizeState, customSelected, cart } = useSelector(
    ({ cashier }) => cashier,
  );
  const { menus: menusCollections = [] } = useSelector(
    ({ cashier }) => cashier,
  );

  const menu = useMemo(() => {
    const menuId = String(customizeState?.menuId || "");
    if (!menuId) return null;
    return (Array.isArray(menusCollections) ? menusCollections : []).find(
      (item) => String(item?._id || "") === menuId,
    );
  }, [customizeState?.menuId, menusCollections]);

  const open = Boolean(customizeState);
  const mode = customizeState?.mode || "add";

  const recommended = useMemo(
    () =>
      Array.isArray(menu?.recommendedAddOns) ? menu.recommendedAddOns : [],
    [menu?.recommendedAddOns],
  );

  const selectedIds = Array.isArray(customSelected) ? customSelected : [];
  const selectedSet = useMemo(
    () =>
      new Set(
        (selectedIds || []).map((id) => String(id || "")).filter(Boolean),
      ),
    [selectedIds],
  );

  const toggle = (addOnId) => {
    const id = String(addOnId || "");
    if (!id) return;
    if (selectedSet.has(id)) {
      dispatch(
        SetCustomSelected(
          (selectedIds || []).filter((entry) => String(entry || "") !== id),
        ),
      );
      return;
    }
    dispatch(SetCustomSelected([...(selectedIds || []), id]));
  };

  const selectedAddOns = useMemo(() => {
    const map = new Map(
      recommended.map((item) => [String(item?._id || ""), item]),
    );
    return (selectedIds || [])
      .map((id) => map.get(String(id || "")))
      .filter(Boolean);
  }, [recommended, selectedIds]);

  const basePrice = Number(menu?.price) || 0;
  const addOnsTotal = selectedAddOns.reduce(
    (sum, item) => sum + (Number(item?.price) || 0),
    0,
  );
  const unitTotal = basePrice + addOnsTotal;

  const grouped = useMemo(() => {
    const groups = { extras: [], toppings: [], sides: [], drinks: [] };
    for (const item of recommended) {
      const group = item?.group && groups[item.group] ? item.group : "extras";
      groups[group].push(item);
    }
    return groups;
  }, [recommended]);

  const groupLabel = (group) => {
    if (group === "toppings") return "Toppings";
    if (group === "sides") return "Sides";
    if (group === "drinks") return "Drinks";
    return "Extras";
  };

  const close = () => {
    dispatch(SetCustomizeState(null));
    dispatch(SetCustomSelected([]));
  };

  const confirm = () => {
    const menuId = String(customizeState?.menuId || "");
    if (!menuId) return close();

    const recommendedMap = new Map(
      recommended.map((item) => [String(item?._id || ""), item]),
    );
    const addOns = (selectedIds || [])
      .map((id) => recommendedMap.get(String(id || "")))
      .filter(Boolean);

    if (mode === "edit" && customizeState?.lineId) {
      dispatch(CartUpdateLineAddOns({ lineId: customizeState.lineId, addOns }));
    } else {
      dispatch(CartAdd({ menu, menuId, addOns }));
    }

    if (mode !== "edit") {
      const sourceMenuId = String(customizeState?.sourceMenuId || menuId || "");
      const sourceCardEl = sourceMenuId
        ? document.querySelector(
            `[data-menu-card][data-menu-id="${sourceMenuId}"]`,
          )
        : null;

      const signature = createCartSignature(
        menuId,
        addOns.map((item) => item?._id),
      );
      const existingLineId =
        (Array.isArray(cart) ? cart : []).find(
          (line) => String(line?.signature || "") === signature,
        )?.id || "";
      const isNewLine = !existingLineId;

      const orderPanel = document.querySelector("[data-cashier-order-panel]");
      const cartButton = document.querySelector("[data-cashier-cart-button]");
      const cartList = document.querySelector("[data-cashier-cart-list]");
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
        : targetLineEl || cartList || orderPanel || cartButton || null;

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

      animateAddToOrder(sourceCardEl || customizeState?.fromPoint, menu, {
        targetEl,
        targetAlign: isNewLine ? "top" : "center",
      });
    }

    close();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent className="max-w-xl rounded-2xl p-0">
        <div className="rounded-2xl border-b bg-[color:color-mix(in_srgb,var(--primary)_6%,var(--card))] px-5 py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-semibold">
              {mode === "edit" ? "Edit add-ons" : "Choose add-ons"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {menu?.name || "Menu item"} • {Formatter.amount(unitTotal)} each
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-auto px-5 py-4">
          {recommended.length ? (
            Object.entries(grouped).map(([group, items]) => {
              if (!items.length) return null;
              return (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {groupLabel(group)}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => {
                      const id = String(item?._id || "");
                      const checked = selectedSet.has(id);
                      return (
                        <div
                          key={id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggle(id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggle(id);
                            }
                          }}
                          className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                            checked
                              ? "bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--card))] shadow-[inset_4px_0_0_var(--color-primary)]"
                              : "bg-background hover:bg-[color:color-mix(in_srgb,var(--primary)_5%,var(--card))]"
                          }`}
                        >
                          <span
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => toggle(id)}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="truncate text-sm font-semibold">
                                {item?.name}
                              </span>
                              <span className="shrink-0 text-xs font-semibold">
                                +{Formatter.amount(Number(item?.price) || 0)}
                              </span>
                            </span>
                            {item?.description ? (
                              <span className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                {item.description}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed bg-background/40 p-4 text-center">
              <p className="text-sm font-semibold">No add-ons available</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This item has no recommended add-ons.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t bg-card/70 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            onClick={() => dispatch(SetCustomSelected([]))}
            disabled={!selectedIds?.length}
          >
            Clear
          </Button>
          <Button type="button" className="h-10 rounded-xl" onClick={confirm}>
            {mode === "edit" ? "Update item" : "Add to order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CashierCustomizeAddOnsDialog;
