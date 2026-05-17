import Cloudinary from "@/services/utilities/cloudinary";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CartAdd,
  SetActiveCategory,
  SetCustomSelected,
  SetCustomizeState,
} from "@/services/redux/slices/stations/cashier";
import { createCartSignature } from "@/services/redux/slices/stations/cashier.utils";
import CashierNoResults from "../no-results";
import animateAddToOrder from "../../../utils/animate-add-to-order";
import MenuCard from "./menu";

const CashierMenusBody = () => {
  const dispatch = useDispatch();

  const {
    menusFiltered = [],
    isLoading: menusLoading,
    categories = [],
    search = "",
  } = useSelector(({ cashier }) => cashier);
  const cart = useSelector(({ cashier }) => cashier?.cart);
  const activeCategory = useSelector(({ cashier }) => cashier?.activeCategory);

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

  const categoryNameById = useMemo(() => {
    const map = new Map();
    for (const category of Array.isArray(categories) ? categories : []) {
      const id = String(category?._id || "");
      if (!id) continue;
      map.set(id, String(category?.name || "").trim());
    }
    return map;
  }, [categories]);

  const categoryOrderById = useMemo(() => {
    const map = new Map();
    const list = Array.isArray(categories) ? categories : [];
    for (let index = 0; index < list.length; index += 1) {
      const id = String(list[index]?._id || "");
      if (!id) continue;
      if (!map.has(id)) map.set(id, index);
    }
    return map;
  }, [categories]);

  const groupedMenus = useMemo(() => {
    const groups = new Map();
    const list = Array.isArray(menusFiltered) ? menusFiltered : [];

    for (const menu of list) {
      const categoryId = String(menu?.category?._id || menu?.category || "");
      const fallbackName =
        String(menu?.category?.name || "").trim() || "Uncategorized";
      const categoryName =
        categoryNameById.get(categoryId) || fallbackName || "Uncategorized";
      const id = categoryId || "uncategorized";

      if (!groups.has(id))
        groups.set(id, { id, name: categoryName, menus: [] });
      groups.get(id).menus.push(menu);
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        menus: (group.menus || [])
          .slice()
          .sort((a, b) =>
            String(a?.name || "").localeCompare(String(b?.name || "")),
          ),
      }))
      .sort((a, b) => {
        if (a.id === "uncategorized" && b.id !== "uncategorized") return 1;
        if (b.id === "uncategorized" && a.id !== "uncategorized") return -1;

        const aIndex = categoryOrderById.get(a.id);
        const bIndex = categoryOrderById.get(b.id);
        const aHas = Number.isFinite(aIndex);
        const bHas = Number.isFinite(bIndex);
        if (aHas && bHas) return aIndex - bIndex;
        if (aHas) return -1;
        if (bHas) return 1;
        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [menusFiltered, categoryNameById, categoryOrderById]);

  useEffect(() => {
    const isSearching = String(search || "").trim().length > 0;
    if (isSearching) return;
    if (typeof window === "undefined" || typeof document === "undefined")
      return;
    if (!groupedMenus.length) return;

    const enableOnUserScroll = () => {
      try {
        if (!window.__cashierDisableScrollSpy) return;
        window.__cashierDisableScrollSpy = false;
        window.__cashierCategoryScrollTarget = "";
        window.__cashierCategoryScrollTargetExpiresAt = 0;
        window.__cashierCategoryScrollTargetSetAt = 0;
      } catch {
        // ignore
      }
    };

    const onKeyDown = (e) => {
      const key = e?.key || "";
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "PageDown" ||
        key === "PageUp" ||
        key === "Home" ||
        key === "End" ||
        key === " " // space
      ) {
        enableOnUserScroll();
      }
    };

    window.addEventListener("wheel", enableOnUserScroll, { passive: true });
    window.addEventListener("touchmove", enableOnUserScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const toolbarEl = document.querySelector("[data-cashier-menu-toolbar]");
        const toolbarBottom = toolbarEl?.getBoundingClientRect?.()?.bottom || 0;
        const anchorY = toolbarBottom + 16;

        const disableScrollSpy = (() => {
          try {
            return Boolean(window.__cashierDisableScrollSpy);
          } catch {
            return false;
          }
        })();

        const lockId = (() => {
          try {
            const id = String(window.__cashierCategoryScrollTarget || "");
            const expiresAt =
              Number(window.__cashierCategoryScrollTargetExpiresAt) || 0;
            if (!id) return "";
            if (expiresAt && Date.now() > expiresAt) {
              window.__cashierCategoryScrollTarget = "";
              window.__cashierCategoryScrollTargetExpiresAt = 0;
              window.__cashierCategoryScrollTargetSetAt = 0;
              return "";
            }
            return id;
          } catch {
            return "";
          }
        })();

        if (disableScrollSpy) {
          if (lockId) dispatch(SetActiveCategory(lockId));
          return;
        }

        if (lockId) {
          dispatch(SetActiveCategory(lockId));
          return;
        }

        try {
          const doc = document.documentElement;
          const scrollBottom = window.scrollY + window.innerHeight;
          const docHeight = doc?.scrollHeight || 0;
          if (docHeight && scrollBottom >= docHeight - 24) {
            const lastId = groupedMenus[groupedMenus.length - 1]?.id || "";
            if (lastId) dispatch(SetActiveCategory(lastId));
            return;
          }
        } catch {
          // ignore
        }

        let bestId = "";
        let bestTop = Number.NEGATIVE_INFINITY;

        for (const group of groupedMenus) {
          const el = document.getElementById(`cashier-category-${group.id}`);
          if (!el) continue;
          const top = el.getBoundingClientRect().top;
          if (top <= anchorY && top > bestTop) {
            bestTop = top;
            bestId = group.id;
          }
        }

        if (bestId) dispatch(SetActiveCategory(bestId));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("wheel", enableOnUserScroll);
      window.removeEventListener("touchmove", enableOnUserScroll);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [dispatch, groupedMenus, search]);

  useEffect(() => {
    const isSearching = String(search || "").trim().length > 0;
    if (isSearching) return;
    if (!groupedMenus.length) return;

    const firstCategoryId = groupedMenus[0]?.id;
    if (!firstCategoryId) return;

    if (!String(activeCategory || "").trim()) {
      dispatch(SetActiveCategory(firstCategoryId));
    }
  }, [dispatch, groupedMenus, activeCategory, search]);

  const renderMenuCard = (menu) => {
    const menuId = String(menu?._id || "");
    const quantity = quantityByMenuId.get(menuId) || 0;
    const imageSrc = getMenuImgSrc(menu);

    return (
      <MenuCard
        key={menuId}
        menu={menu}
        quantity={quantity}
        imageSrc={imageSrc}
        onAdd={(e) => {
          const menuCardEl = e?.currentTarget?.closest?.("[data-menu-card]");
          const originEl = menuCardEl || e?.currentTarget;

          if (menu?.recommendedAddOns?.length) {
            const rect = originEl?.getBoundingClientRect?.();
            const fromPoint =
              rect && rect.width >= 8 && rect.height >= 8
                ? {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                  }
                : null;

            dispatch(SetCustomSelected([]));
            dispatch(
              SetCustomizeState({
                menuId,
                mode: "add",
                sourceMenuId: menuId,
                fromPoint,
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

          animateAddToOrder(originEl, menu, {
            targetEl,
            targetAlign: isNewLine ? "top" : "center",
          });
          dispatch(CartAdd({ menu, addOns: [] }));
        }}
      />
    );
  };

  if (menusLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {new Array(12).fill(null).map((_, index) => (
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
        ))}
      </div>
    );
  }

  if (String(search || "").trim().length) {
    if (!menusFiltered.length) return <CashierNoResults />;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {menusFiltered.map(renderMenuCard)}
      </div>
    );
  }

  if (groupedMenus.length) {
    return (
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] sm:gap-x-4">
        {groupedMenus.map((group) => (
          <div
            key={group.id}
            id={`cashier-category-${group.id}`}
            className="col-span-full space-y-4"
          >
            <div className="flex items-center gap-3">
              <p className="shrink-0">
                <span className="inline-flex items-center rounded-full border bg-muted/30 px-3 py-1 text-sm font-semibold leading-none text-foreground">
                  {group.name}
                </span>
              </p>
              <div className="h-px flex-1 bg-border/70" />
              <p className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-xs font-medium leading-none text-muted-foreground">
                {group.menus.length} item{group.menus.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {group.menus.map(renderMenuCard)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <CashierNoResults />;
};

export default CashierMenusBody;
