import {
  SEARCH as SEARCH_MENUS,
  SetActiveCategory,
} from "@/services/redux/slices/stations/cashier";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoryScroller from "./category-scroller";

const initialMenuGap = 16;

const CashierMenusHeader = () => {
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
  const previousSearchRef = useRef("");

	  useEffect(() => {
	    const el = menuToolbarRef.current;
	    if (!el || typeof window === "undefined") return;

	    const update = () => {
	      const next = Math.round(el.getBoundingClientRect()?.height || 0);
	      if (!next) return;
	      setMenuToolbarHeight((prev) => (prev === next ? prev : next));
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
    const y =
      window.scrollY + el.getBoundingClientRect().top - toolbarBottom - 12;

    try {
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    } catch {
      window.scrollTo(0, Math.max(0, y));
    }

    try {
      const checkArrived = () => {
        const lockId = String(window.__cashierCategoryScrollTarget || "");
        const expiresAt =
          Number(window.__cashierCategoryScrollTargetExpiresAt) || 0;
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

        window.__cashierCategoryLockRaf =
          window.requestAnimationFrame(checkArrived);
      };

      window.__cashierCategoryLockRaf = window.requestAnimationFrame(checkArrived);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const prev = String(previousSearchRef.current || "");
    const next = String(search || "");
    previousSearchRef.current = next;

    const wasSearching = prev.trim().length > 0;
    const isSearching = next.trim().length > 0;
    if (!wasSearching || isSearching) return;

    const firstCategoryId = String(categories?.[0]?._id || "");
    if (!firstCategoryId) return;

    dispatch(SetActiveCategory(firstCategoryId));
  }, [search, categories, dispatch]);

  const handleCategorySelect = useCallback(
    (value) => {
      const id = String(value || "");
      if (!id) return;
      if (typeof window === "undefined") return;

      const isSearching = String(search || "").trim().length > 0;
      if (isSearching) dispatch(SEARCH_MENUS(""));

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

export default CashierMenusHeader;

