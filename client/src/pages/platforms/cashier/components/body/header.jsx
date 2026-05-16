import {
  SetActiveCategory,
  SEARCH as SEARCH_MENUS,
} from "@/services/redux/slices/stations/cashier";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialMenuGap = 16;

const CashierBodyHeader = () => {
  const dispatch = useDispatch();
  const menuToolbarRef = useRef(null);
  const [menuToolbarHeight, setMenuToolbarHeight] = useState(0);
  const [menuTopGap, setMenuTopGap] = useState(initialMenuGap);

  const {
    categories,
    activeCategory = "",
    search = "",
    isLoading: categoriesLoading,
  } = useSelector(({ cashier }) => cashier);

  useEffect(() => {
    const el = menuToolbarRef.current;
    if (!el || typeof window === "undefined") return;

    const update = () => {
      const next = Math.round(el.getBoundingClientRect()?.height || 0);
      setMenuToolbarHeight(next);
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMenuTopGap(initialMenuGap);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const next = Math.max(0, initialMenuGap - window.scrollY);
        setMenuTopGap(next);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const menuToolbarSpacer = (menuToolbarHeight || 128) + menuTopGap;

  const scrollToCategory = useCallback((categoryId) => {
    const id = String(categoryId || "");
    if (!id || typeof document === "undefined") return;

    try {
      if (window.__cashierCategoryLockRaf) {
        window.cancelAnimationFrame(window.__cashierCategoryLockRaf);
        window.__cashierCategoryLockRaf = 0;
      }
      window.__cashierDisableScrollSpy = true;
      window.__cashierCategoryScrollTarget = id;
      window.__cashierCategoryScrollTargetExpiresAt = Date.now() + 6000;
      window.__cashierCategoryScrollTargetSetAt = Date.now();
    } catch {
      // ignore
    }

    const el = document.getElementById(`cashier-category-${id}`);
    if (!el) return;

    const toolbarEl = document.querySelector("[data-cashier-menu-toolbar]");
    const toolbarBottom = toolbarEl?.getBoundingClientRect?.()?.bottom || 0;
    const y = window.scrollY + el.getBoundingClientRect().top - toolbarBottom - 12;

    try {
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    } catch {
      window.scrollTo(0, Math.max(0, y));
    }

    // Clear the lock once we've arrived (works even if scroll events stop firing).
    try {
      const checkArrived = () => {
        const lockId = String(window.__cashierCategoryScrollTarget || "");
        const expiresAt = Number(window.__cashierCategoryScrollTargetExpiresAt) || 0;
        if (!lockId) return;
        if (expiresAt && Date.now() > expiresAt) {
          window.__cashierCategoryScrollTarget = "";
          window.__cashierCategoryScrollTargetExpiresAt = 0;
          window.__cashierCategoryScrollTargetSetAt = 0;
          window.__cashierCategoryLockRaf = 0;
          return;
        }

        const targetEl = document.getElementById(`cashier-category-${lockId}`);
        const toolbarEl = document.querySelector("[data-cashier-menu-toolbar]");
        const toolbarBottomNow =
          toolbarEl?.getBoundingClientRect?.()?.bottom || 0;
        const anchorY = toolbarBottomNow + 16;
        const delta = targetEl?.getBoundingClientRect?.()?.top - anchorY;
        if (Number.isFinite(delta) && Math.abs(delta) <= 24) {
          window.__cashierCategoryScrollTarget = "";
          window.__cashierCategoryScrollTargetExpiresAt = 0;
          window.__cashierCategoryScrollTargetSetAt = 0;
          window.__cashierCategoryLockRaf = 0;
          return;
        }

        window.__cashierCategoryLockRaf = window.requestAnimationFrame(checkArrived);
      };

      window.__cashierCategoryLockRaf = window.requestAnimationFrame(checkArrived);
    } catch {
      // ignore
    }
  }, []);

  const handleCategorySelect = useCallback(
    (value) => {
      const id = String(value || "");
      if (!id) return;
      if (typeof window === "undefined") return;

      const isSearching = String(search || "").trim().length > 0;
      if (isSearching) dispatch(SEARCH_MENUS(""));

      // Wait for list to re-render (ungrouped -> grouped) before scrolling.
      window.setTimeout(() => {
        scrollToCategory(id);
        dispatch(SetActiveCategory(id));
      }, 0);
    },
    [dispatch, scrollToCategory, search],
  );

  return (
    <>
      <div
        className="fixed inset-x-0 z-20 bg-background"
        style={{
          top: "var(--cashier-topbar-height, 92px)",
        }}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 lg:px-6">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_380px]">
            <div ref={menuToolbarRef} className="min-w-0 pt-4 pb-0">
              <div
                data-cashier-menu-toolbar
                className="min-w-0 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-[280px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => {
                          dispatch(SEARCH_MENUS(e.target.value));
                          try {
                            window.scrollTo({ top: 0, behavior: "auto" });
                          } catch {
                            // ignore
                          }
                        }}
                        placeholder="Search menu..."
                        className="h-10 rounded-xl pl-9"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
                      <div className="hidden min-w-0 flex-1 md:block">
                        <CategoryScroller
                          categories={categories}
                          activeCategory={activeCategory}
                          isLoading={categoriesLoading}
                          onChange={handleCategorySelect}
                        />
                      </div>

                      <div className="md:hidden">
                        <Select
                          value={activeCategory}
                          onValueChange={handleCategorySelect}
                        >
                          <SelectTrigger className="h-10 rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent align="start">
                            {categories.map((category) => (
                              <SelectItem
                                key={category._id}
                                value={String(category._id)}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      <div aria-hidden style={{ height: menuToolbarSpacer }} />
    </>
  );
};

const CategoryScroller = ({
  categories = [],
  activeCategory = "all",
  isLoading,
  onChange,
}) => {
  const scrollerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    cleanup: null,
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const epsilon = 1;
    setCanScrollLeft(el.scrollLeft > epsilon);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth - epsilon,
    );
  }, []);

  useEffect(() => {
    updateScrollButtons();

    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => updateScrollButtons();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateScrollButtons, categories?.length, isLoading]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (isLoading) return;
    const id = String(activeCategory || "");
    if (!id) return;
    if (isDragging || dragRef.current.isDragging) return;

    const activeEl = el.querySelector(`[data-category-id="${id}"]`);
    if (!activeEl?.getBoundingClientRect) return;

    const containerRect = el.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    const padding = 12;

    const overflowLeft = itemRect.left < containerRect.left + padding;
    const overflowRight = itemRect.right > containerRect.right - padding;

    if (!overflowLeft && !overflowRight) return;

    const targetLeft =
      activeEl.offsetLeft - (el.clientWidth - activeEl.clientWidth) / 2;

    try {
      el.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
    } catch {
      el.scrollLeft = Math.max(0, targetLeft);
    }
  }, [activeCategory, isLoading, isDragging]);

  const scrollByAmount = useCallback((delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const endPointer = useCallback(
    (e) => {
      const el = scrollerRef.current;
      const didDrag = dragRef.current.moved;
      dragRef.current.isDragging = false;
      setIsDragging(false);
      try {
        el?.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore.
      }

      if (typeof dragRef.current.cleanup === "function")
        dragRef.current.cleanup();

      if (didDrag) {
        setTimeout(() => {
          dragRef.current.moved = false;
        }, 0);
      }
    },
    [setIsDragging],
  );

  const handlePointerDown = useCallback(
    (e) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      if (typeof dragRef.current.cleanup === "function")
        dragRef.current.cleanup();

      dragRef.current.isDragging = false;
      dragRef.current.pointerId = e.pointerId;
      dragRef.current.startX = e.clientX;
      dragRef.current.startScrollLeft = el.scrollLeft;
      dragRef.current.moved = false;

      const onWindowPointerUp = (ev) => {
        if (dragRef.current.pointerId !== ev.pointerId) return;
        endPointer(ev);
      };

      const onWindowPointerCancel = (ev) => {
        if (dragRef.current.pointerId !== ev.pointerId) return;
        endPointer(ev);
      };

      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerCancel);

      dragRef.current.cleanup = () => {
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerCancel);
        dragRef.current.cleanup = null;
      };
    },
    [endPointer],
  );

  const handlePointerMove = useCallback(
    (e) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (dragRef.current.pointerId !== e.pointerId) return;

      if (e.pointerType === "mouse" && (e.buttons & 1) === 0) {
        endPointer(e);
        return;
      }

      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) <= 4 && !dragRef.current.isDragging) return;

      if (!dragRef.current.isDragging) {
        dragRef.current.isDragging = true;
        setIsDragging(true);
        dragRef.current.moved = true;

        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Ignore.
        }
      }

      el.scrollLeft = dragRef.current.startScrollLeft - dx;
    },
    [endPointer],
  );

  const handleWheel = useCallback((e) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth) return;

    const delta = e.shiftKey ? e.deltaY : e.deltaX;
    if (delta) el.scrollLeft += delta;
  }, []);

  const handleCategoryClick = useCallback(
    (categoryId) => {
      if (dragRef.current.moved) return;
      if (typeof onChange === "function") onChange(categoryId);
    },
    [onChange],
  );

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollByAmount(-240)}
        disabled={!canScrollLeft}
        className={`hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:inline-flex ${
          canScrollLeft ? "hover:bg-card" : "cursor-default opacity-30"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-background to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-background to-transparent" />
        )}
        <div
          ref={scrollerRef}
          className={`flex min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden py-0.5 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={handleWheel}
        >
          {isLoading
            ? new Array(10)
                .fill(null)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    className={`h-9 shrink-0 rounded-full ${
                      index % 5 === 0
                        ? "w-16"
                        : index % 5 === 1
                          ? "w-24"
                          : index % 5 === 2
                            ? "w-20"
                            : index % 5 === 3
                              ? "w-28"
                              : "w-24"
                    }`}
                  />
                ))
            : [
                ...(Array.isArray(categories) ? categories : []),
              ].map((category) => {
                const id = String(category?._id || "");
                if (!id) return null;
                const isActive = String(activeCategory) === id;

                return (
                  <button
                    key={id}
                    data-category-id={id}
                    type="button"
                    onClick={() => handleCategoryClick(id)}
                    className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 py-0 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    <span className="max-w-[120px] truncate sm:max-w-none">
                      {category?.name}
                    </span>
                  </button>
                );
              })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollByAmount(240)}
        disabled={!canScrollRight}
        className={`hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:inline-flex ${
          canScrollRight ? "hover:bg-card" : "cursor-default opacity-30"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CashierBodyHeader;
