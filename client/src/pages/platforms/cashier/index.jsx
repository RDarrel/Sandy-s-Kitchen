import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter, PresetImage } from "@/services/utilities";
import {
  BROWSE as BROWSE_MENUS,
  FilterBY_AVAILABILITY,
  FilterBY_CATEGORY,
  SEARCH as SEARCH_MENUS,
} from "@/services/redux/slices/menu/menus";
import { BROWSE as BROWSE_CATEGORIES } from "@/services/redux/slices/menu/categories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
	import { Badge } from "@/components/ui/badge";
	import { Button } from "@/components/ui/button";
	import { Card } from "@/components/ui/card";
	import { Checkbox } from "@/components/ui/checkbox";
	import {
	  Dialog,
	  DialogContent,
	  DialogDescription,
	  DialogFooter,
	  DialogHeader,
	  DialogTitle,
	} from "@/components/ui/dialog";
	import {
	  DropdownMenu,
	  DropdownMenuContent,
	  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
	import { Skeleton } from "@/components/ui/skeleton";
	import {
	  ChefHat,
	  ChevronLeft,
	  ChevronRight,
	  ChevronDown,
	  LogOut,
	  Minus,
	  Plus,
	  Search,
	  ShoppingCart,
	  SlidersHorizontal,
	  Trash2,
	} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Cashier = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, auth = {} } = useSelector(({ auth }) => auth);
  const {
    collections: menusCollections = [],
    filtered: menusFiltered = [],
    category: activeCategory = "all",
    search = "",
    isLoading: menusLoading,
  } = useSelector(({ menus }) => menus);
  const { collections: categoriesCollections = [], isLoading: categoriesLoading } = useSelector(
    ({ menuCategories }) => menuCategories,
	  );
	
	  const [cartOpen, setCartOpen] = useState(false);
	  const [cart, setCart] = useState(() => loadCashierCart());
	  const [customizeState, setCustomizeState] = useState(null);
	  const [customSelected, setCustomSelected] = useState([]);
		  const orderCardRef = useRef(null);
		  const cartButtonRef = useRef(null);

			  const animateAddToOrder = (fromEl, menu) => {
			    try {
			      if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve();
			      if (!fromEl?.getBoundingClientRect) return Promise.resolve();
			      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return Promise.resolve();

		      const cardEl = fromEl?.closest?.("[data-menu-card]") || null;
			      const sourceEl = cardEl || fromEl;
			      const fromRect = sourceEl.getBoundingClientRect();
			      if (!fromRect || fromRect.width < 8 || fromRect.height < 8) return Promise.resolve();

		      const fromX = fromRect.left + fromRect.width / 2;
		      const fromY = fromRect.top + fromRect.height / 2;

		      const targetEl = orderCardRef.current || cartButtonRef.current;
		      const targetRect = targetEl?.getBoundingClientRect?.();
		      const useFallback =
		        !targetRect || targetRect.width < 8 || targetRect.height < 8 || targetRect.bottom < 0;
		      const fallbackRect = cartButtonRef.current?.getBoundingClientRect?.();
			      const toRect = useFallback ? fallbackRect : targetRect;
			      if (!toRect || toRect.width < 8 || toRect.height < 8) return Promise.resolve();

		      const toX = toRect.left + toRect.width / 2;
		      const toY = toRect.top + Math.min(toRect.height * 0.35, 120);

			      const dx = toX - fromX;
			      const dy = toY - fromY;
			      const distance = Math.hypot(dx, dy) || 1;
			      const unitX = dx / distance;
			      const unitY = dy / distance;

		      const flyer = cardEl ? cardEl.cloneNode(true) : document.createElement("div");

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

			      // Small "grab" feedback on the original card (no lift).
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

			      const duration = 520;
			      const easing = "cubic-bezier(0.22, 1, 0.36, 1)";

			      // No pulse on the Current Order card; the cart row animation is enough feedback.

				      const midX = dx * 0.7;
				      const midY = dy * 0.7;

			      const start =
			        cardEl
			          ? "translate3d(0px, 0px, 0) scale(1) rotate(0deg)"
			          : "translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1) rotate(0deg)";
				      const mid =
				        cardEl
				          ? `translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`
				          : `translate(-50%, -50%) translate3d(${midX}px, ${midY}px, 0) scale(0.94) rotate(0deg)`;
				      const end =
				        cardEl
				          ? `translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`
				          : `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0) scale(0.2) rotate(0deg)`;

			      const anim = flyer.animate(
			        [
			          { transform: start, opacity: 1 },
			          { transform: mid, opacity: 1, offset: 0.55 },
			          { transform: end, opacity: 1, offset: 0.88 },
			          { transform: end, opacity: 0, offset: 1 },
			        ],
			        { duration, easing, fill: "both" },
			      );

			      const cleanup = () => flyer.remove();

			      // Resolve slightly before the end so the cart update "lands" as the card arrives,
			      // while cleanup still happens on finish/cancel.
			      const arrivalMs = Math.max(0, Math.round(duration * 0.58));
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

  const categories = useMemo(() => {
    return (Array.isArray(categoriesCollections) ? categoriesCollections : [])
      .filter((category) => !category?.deletedAt)
      .filter((category) => !category?.status || category.status === "active")
      .sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));
  }, [categoriesCollections]);

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
	
		  const cartEntries = useMemo(() => {
		    return cartLines
		      .map((line) => {
		        const menu = menuById.get(String(line.menuId));
		        if (!menu) return null;
		        return { line, menu };
		      })
		      .filter(Boolean)
		      .sort((a, b) => {
		        const updatedSort = (b?.line?.updatedAt || 0) - (a?.line?.updatedAt || 0);
		        if (updatedSort) return updatedSort;
		        const nameSort = String(a?.menu?.name || "").localeCompare(String(b?.menu?.name || ""));
		        if (nameSort) return nameSort;
		        return String(a?.line?.signature || "").localeCompare(String(b?.line?.signature || ""));
		      });
		  }, [cartLines, menuById]);
	
	  const cartTotals = useMemo(() => {
	    const totalItems = cartEntries.reduce((sum, entry) => sum + (entry?.line?.quantity || 0), 0);
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

	  useEffect(() => {
	    dispatch(FilterBY_AVAILABILITY("all"));
	    dispatch(BROWSE_MENUS({ token }));
	    dispatch(BROWSE_CATEGORIES({ token }));
	  }, [token, dispatch]);

	  useEffect(() => {
	    try {
	      localStorage.setItem("cashierCart", JSON.stringify(cart || { version: 2, lines: [] }));
	    } catch {
	      // ignore write errors
	    }
	  }, [cart]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

	  const getMenuImgSrc = (menu) => {
	    if (menu?.imgId) return Cloudinary.getMenuImg(menu.imgId, menu?._id);
	    if (menu?.image) return menu.image;
	    return null;
	  };
	
		  const addToCart = ({ menuId, addOns = [] }) => {
		    const normalizedMenuId = String(menuId || "");
		    if (!normalizedMenuId) return;
		    const now = Date.now();
	
	    const normalizedAddOns = (Array.isArray(addOns) ? addOns : [])
	      .map((item) => ({
	        _id: String(item?._id || ""),
	        name: item?.name || "Untitled add-on",
	        price: Number(item?.price) || 0,
	        group: item?.group || "extras",
	      }))
	      .filter((item) => item._id)
	      .sort((a, b) => a._id.localeCompare(b._id));
	
	    const signature = createCartSignature(
	      normalizedMenuId,
	      normalizedAddOns.map((item) => item._id),
	    );
	
		    setCart((prev) => {
		      const prevLines = Array.isArray(prev?.lines) ? prev.lines : [];
		      const existingIndex = prevLines.findIndex((line) => String(line?.signature || "") === signature);
		      if (existingIndex > -1) {
		        const nextLines = [...prevLines];
		        const current = nextLines[existingIndex];
		        nextLines[existingIndex] = {
		          ...current,
		          quantity: (Number(current?.quantity) || 0) + 1,
		          updatedAt: now,
		        };
		        return { version: 2, lines: nextLines };
		      }
		
		      const nextLine = {
		        id: createCartLineId(),
		        menuId: normalizedMenuId,
		        quantity: 1,
		        addOns: normalizedAddOns,
		        signature,
		        updatedAt: now,
		      };
		      return { version: 2, lines: [nextLine, ...prevLines] };
		    });
		  };
	
		  const incrementLine = (lineId) => {
		    const id = String(lineId || "");
		    if (!id) return;
		    const now = Date.now();
		    setCart((prev) => {
		      const prevLines = Array.isArray(prev?.lines) ? prev.lines : [];
		      const nextLines = prevLines.map((line) =>
		        String(line?.id) === id
		          ? { ...line, quantity: (Number(line?.quantity) || 0) + 1, updatedAt: now }
		          : line,
		      );
		      return { version: 2, lines: nextLines };
		    });
		  };
	
		  const decrementLine = (lineId) => {
		    const id = String(lineId || "");
		    if (!id) return;
		    setCart((prev) => {
	      const prevLines = Array.isArray(prev?.lines) ? prev.lines : [];
	      const nextLines = prevLines
	        .map((line) => {
	          if (String(line?.id) !== id) return line;
	          const nextQty = (Number(line?.quantity) || 0) - 1;
	          if (nextQty <= 0) return null;
	          return { ...line, quantity: nextQty };
	        })
	        .filter(Boolean);
		      return { version: 2, lines: nextLines };
		    });
		  };

		  const removeLine = (lineId) => {
		    const id = String(lineId || "");
		    if (!id) return;
		    setCart((prev) => {
		      const prevLines = Array.isArray(prev?.lines) ? prev.lines : [];
		      const nextLines = prevLines.filter((line) => String(line?.id) !== id);
		      return { version: 2, lines: nextLines };
		    });
		  };
	
		  const updateLineAddOns = ({ lineId, addOns = [] }) => {
		    const id = String(lineId || "");
		    if (!id) return;
		    const now = Date.now();
	
	    const normalizedAddOns = (Array.isArray(addOns) ? addOns : [])
	      .map((item) => ({
	        _id: String(item?._id || ""),
	        name: item?.name || "Untitled add-on",
	        price: Number(item?.price) || 0,
	        group: item?.group || "extras",
	      }))
	      .filter((item) => item._id)
	      .sort((a, b) => a._id.localeCompare(b._id));
	
	    setCart((prev) => {
	      const prevLines = Array.isArray(prev?.lines) ? prev.lines : [];
	      const index = prevLines.findIndex((line) => String(line?.id) === id);
	      if (index < 0) return prev;
	
	      const target = prevLines[index];
	      const menuId = String(target?.menuId || "");
	      if (!menuId) return prev;
	
	      const signature = createCartSignature(menuId, normalizedAddOns.map((item) => item._id));
	      const mergeIndex = prevLines.findIndex(
	        (line, idx) => idx !== index && String(line?.signature || "") === signature,
	      );
	
	      if (mergeIndex > -1) {
	        const nextLines = [...prevLines];
	        const base = nextLines[mergeIndex];
	        nextLines[mergeIndex] = {
	          ...base,
	          quantity: (Number(base?.quantity) || 0) + (Number(target?.quantity) || 0),
	        };
	        nextLines.splice(index, 1);
	        return { version: 2, lines: nextLines };
	      }
	
		      const nextLines = [...prevLines];
		      nextLines[index] = { ...target, addOns: normalizedAddOns, signature };
		      nextLines[index].updatedAt = now;
		      return { version: 2, lines: nextLines };
		    });
		  };
	
	  const clearCart = () => setCart({ version: 2, lines: [] });
	
	  const openCustomizeForMenu = (menu) => {
	    const menuId = String(menu?._id || "");
	    if (!menuId) return;
	    setCustomSelected([]);
	    setCustomizeState({ mode: "add", menuId, lineId: null });
	  };
	
	  const openCustomizeForLine = (line) => {
	    const lineId = String(line?.id || "");
	    const menuId = String(line?.menuId || "");
	    if (!lineId || !menuId) return;
	    setCustomSelected((line?.addOns || []).map((item) => String(item?._id || "")).filter(Boolean));
	    setCustomizeState({ mode: "edit", menuId, lineId });
	  };
	
	  const closeCustomize = () => {
	    setCustomizeState(null);
	    setCustomSelected([]);
	  };

	  const pendingCount = cartTotals.totalItems;

	  return (
		    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
	      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_-10%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_60%)]" />
	      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_85%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_62%)]" />
	
		      <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/75 backdrop-blur">
	        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
	          <div className="flex min-w-0 items-center gap-2">
	            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
	              <ChefHat className="h-5 w-5" />
	            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight sm:text-base">
                Sandy&apos;s Kitchenette
              </p>
              <p className="truncate text-[11px] text-muted-foreground">Cashier station</p>
	              </div>
	
		            </div>
	
	          <div className="hidden items-center gap-2 md:flex">
	            <StatusPill label="Pending" count={pendingCount} tone="pending" />
	          </div>

          <div className="flex items-center gap-2">
		            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
		              <Button
		                ref={cartButtonRef}
		                type="button"
		                variant="outline"
		                className="relative h-10 rounded-xl lg:hidden"
		                onClick={() => setCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartTotals.totalItems > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                    {cartTotals.totalItems}
                  </span>
                )}
              </Button>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader className="pb-2">
                  <SheetTitle>Current order</SheetTitle>
                </SheetHeader>
		                <CartPanel
		                  entries={cartEntries}
		                  totals={cartTotals}
		                  onIncrement={incrementLine}
		                  onDecrement={decrementLine}
		                  onRemove={removeLine}
		                  onClear={clearCart}
		                  onCustomize={openCustomizeForLine}
		                />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="h-10 rounded-xl px-2.5">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={PresetImage(auth?.isMale)} alt="Profile" />
                    <AvatarFallback>{String(auth?.email || "?")[0]}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:inline">
                    {auth?.fullName?.fname || auth?.fname || "Cashier"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9 rounded-lg">
                      <AvatarImage src={PresetImage(auth?.isMale)} alt="Profile" />
                      <AvatarFallback className="rounded-lg">
                        {String(auth?.email || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {auth?.fullName?.fname || auth?.fname || "Cashier"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {auth?.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

	        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-2 px-4 pb-3 md:hidden lg:px-6">
	          <div className="flex items-center gap-2">
	            <StatusPill label="Pending" count={pendingCount} tone="pending" />
	          </div>
	        </div>
	      </header>

			      <main className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 pt-[120px] md:pt-[92px] lg:px-6 lg:pb-6">
			        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
			          <section className="min-w-0">
	            <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur">
	              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
	                  <div className="relative w-full sm:max-w-[340px]">
	                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
	                    <Input
	                      value={search}
	                      onChange={(e) => dispatch(SEARCH_MENUS(e.target.value))}
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
	                        onChange={(value) => dispatch(FilterBY_CATEGORY(value || "all"))}
	                      />
	                    </div>

	                    <div className="md:hidden">
	                      <Select
	                        value={activeCategory}
	                        onValueChange={(value) => dispatch(FilterBY_CATEGORY(value || "all"))}
                      >
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent align="start">
                          <SelectItem value="all">All categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={String(category._id)}>
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

	            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {menusLoading
                ? new Array(8).fill(null).map((_, index) => (
                    <Card key={index} className="overflow-hidden rounded-2xl py-0">
                      <Skeleton className="h-40 w-full" />
                      <div className="space-y-3 px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-full space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-14" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-9 w-full rounded-xl" />
                          <Skeleton className="h-9 w-full rounded-xl" />
                        </div>
                      </div>
                    </Card>
                  ))
                : menusFiltered.map((menu) => (
                    <MenuCard
	                      key={menu?._id}
	                      menu={menu}
	                      categoryName={
	                        categories.find((c) => String(c?._id) === String(menu?.category))
	                          ?.name || ""
	                      }
	                      quantity={quantityByMenuId.get(String(menu?._id || "")) || 0}
	                      imageSrc={getMenuImgSrc(menu)}
		                      onAdd={async (e) => {
		                        const hasAddOns =
		                          Array.isArray(menu?.recommendedAddOns) && menu.recommendedAddOns.length;
		                        if (hasAddOns) return openCustomizeForMenu(menu);
		                        await animateAddToOrder(e?.currentTarget, menu);
		                        addToCart({ menuId: menu?._id, addOns: [] });
		                      }}
		                      onCustomize={() => openCustomizeForMenu(menu)}
		                    />
		                  ))}
	            </div>
	          </section>
	
			          <aside className="hidden lg:block">
			            <div className="relative h-[calc(100dvh-92px)]">
				              <div
				                ref={orderCardRef}
				                className="fixed top-[92px] right-[max(1.5rem,calc((100vw-1536px)/2+1.5rem))] z-20 flex h-[calc(100dvh-92px-1.5rem)] w-[380px] flex-col rounded-2xl border bg-card shadow-sm"
				              >
		              <div className="flex items-center justify-between gap-2 p-4">
		                <div>
		                  <p className="text-sm font-semibold">Current order</p>
		                  <p className="text-xs text-muted-foreground">
		                    {cartEntries.length ? "Review items before checkout." : "No items yet."}
		                  </p>
		                </div>
	                <Button
	                  type="button"
	                  variant="ghost"
	                  className="h-9 rounded-xl"
	                  disabled={!cartEntries.length}
	                  onClick={clearCart}
	                >
	                  <Trash2 className="h-4 w-4" />
	                  Clear
		                </Button>
		              </div>
		              <Separator />
		              <div className="flex-1 min-h-0 p-4">
			                <CartPanel
			                  entries={cartEntries}
			                  totals={cartTotals}
			                  onIncrement={incrementLine}
		                  onDecrement={decrementLine}
		                  onRemove={removeLine}
		                  onClear={clearCart}
		                  onCustomize={openCustomizeForLine}
		                />
	              </div>
			            </div>
			            </div>
	          </aside>
        </div>
	      </main>
	
	      <CustomizeAddOnsDialog
	        open={Boolean(customizeState)}
	        mode={customizeState?.mode || "add"}
	        menu={menuById.get(String(customizeState?.menuId || "")) || null}
	        selectedIds={customSelected}
	        onSelectedIdsChange={setCustomSelected}
	        onOpenChange={(nextOpen) => {
	          if (!nextOpen) closeCustomize();
	        }}
	        onConfirm={() => {
	          const menu = menuById.get(String(customizeState?.menuId || ""));
	          if (!menu?._id) return closeCustomize();
	
	          const recommended = Array.isArray(menu?.recommendedAddOns) ? menu.recommendedAddOns : [];
	          const recommendedMap = new Map(recommended.map((item) => [String(item?._id || ""), item]));
	          const addOns = (customSelected || [])
	            .map((id) => recommendedMap.get(String(id || "")))
	            .filter(Boolean);
	
	          if (customizeState?.mode === "edit" && customizeState?.lineId) {
	            updateLineAddOns({ lineId: customizeState.lineId, addOns });
	          } else {
	            addToCart({ menuId: menu._id, addOns });
	          }
	
	          closeCustomize();
	        }}
	      />
	    </div>
	  );
	};

export default Cashier;

const CategoryScroller = ({ categories = [], activeCategory = "all", isLoading, onChange }) => {
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
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - epsilon);
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

      if (typeof dragRef.current.cleanup === "function") dragRef.current.cleanup();

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

      if (typeof dragRef.current.cleanup === "function") dragRef.current.cleanup();

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
          canScrollLeft ? "hover:bg-card" : "opacity-30 cursor-default"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="relative w-full min-w-0 overflow-hidden">
        {canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent" />
        )}

        <div
          ref={scrollerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={handleWheel}
          style={{ touchAction: "pan-y" }}
          className={`no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto py-0.5 select-none sm:gap-2 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {isLoading
            ? new Array(10).fill(null).map((_, index) => (
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
            : [{ _id: "all", name: "All" }, ...(Array.isArray(categories) ? categories : [])].map(
                (category) => {
                  const id = String(category?._id || "all");
                  const isActive = String(activeCategory) === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleCategoryClick(id)}
                      className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 py-0 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-4 sm:text-sm ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <span className="max-w-[120px] truncate sm:max-w-none">{category?.name}</span>
                    </button>
                  );
                },
              )}
        </div>
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollByAmount(240)}
        disabled={!canScrollRight}
        className={`hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:inline-flex ${
          canScrollRight ? "hover:bg-card" : "opacity-30 cursor-default"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const StatusPill = ({ label, count, tone }) => {
	  const toneClass =
	    tone === "ready"
	      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
      : tone === "prepared"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-200"
        : "border-border bg-secondary text-secondary-foreground";

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${toneClass}`}>
      <span className="text-[11px] font-semibold">{label}</span>
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1.5 text-[11px] font-bold text-foreground shadow-xs">
        {Number(count) || 0}
      </span>
    </div>
  );
};

	const MenuCard = ({ menu, categoryName, quantity, imageSrc, onAdd, onCustomize }) => {
	  const isAvailable = Boolean(menu?.isAvailable ?? menu?.isPublish);
	  const hasAddOns = Array.isArray(menu?.recommendedAddOns) && menu.recommendedAddOns.length > 0;
	  const price = Number(menu?.price) || 0;

  return (
    <Card
      data-menu-card
      data-menu-id={String(menu?._id || "")}
      className="group overflow-hidden rounded-2xl py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 bg-muted/40">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={menu?.name || "Menu image"}
            className={`h-full w-full object-cover object-center transition duration-500 group-hover:scale-105 ${
              isAvailable ? "" : "opacity-70 grayscale-[15%]"
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/60 to-muted/40">
            <ChefHat className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

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

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{menu?.name || "—"}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {categoryName || "Uncategorized"}
              {menu?.type ? ` • ${String(menu.type)}` : ""}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold">{Formatter.amount(price)}</p>
        </div>

	        <div className={`grid gap-2 ${hasAddOns ? "grid-cols-2" : "grid-cols-1"}`}>
	          {hasAddOns ? (
	            <Button
	              type="button"
	              variant="outline"
	              className="h-9 rounded-xl"
	              onClick={onCustomize}
	            >
	              <SlidersHorizontal className="h-4 w-4" />
	              Add-ons
	            </Button>
	          ) : null}
	
	          <Button type="button" className="h-9 rounded-xl" onClick={onAdd}>
	            <Plus className="h-4 w-4" />
	            Add
	          </Button>
	        </div>
      </div>
    </Card>
  );
};

const CartPanel = ({ entries, totals, onIncrement, onDecrement, onRemove, onClear, onCustomize }) => {
  const animatedByLineIdRef = useRef(new Map());

  const animateLineEl = useCallback((el, lineId, updatedAt) => {
    if (!el) return;
    if (!updatedAt) return;

    const lastAnimated = animatedByLineIdRef.current.get(lineId);
    if (lastAnimated === updatedAt) return;
    animatedByLineIdRef.current.set(lineId, updatedAt);

    try {
      if (typeof window !== "undefined") {
        const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (reduce) return;
      }

      el.animate(
        [
          {
            transform: "translate3d(0,-10px,0) scale(0.985)",
            opacity: 0.6,
          },
          {
            transform: "translate3d(0,0,0) scale(1)",
            opacity: 1,
          },
        ],
        { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
      );
    } catch {
      // ignore animation errors
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
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
            const addOnNames = (line?.addOns || []).map((item) => item?.name).filter(Boolean);

            return (
              <div
                ref={(el) =>
                  animateLineEl(el, lineId, Number(line?.updatedAt) || 0)
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
	                      <p className="min-w-0 truncate text-sm font-semibold">{menu?.name}</p>
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
	                    <Button
	                      type="button"
	                      variant="outline"
	                      size="icon"
	                      className="h-9 w-9 rounded-xl"
	                      onClick={() => onCustomize?.(line)}
	                    >
	                      <SlidersHorizontal className="h-4 w-4" />
	                    </Button>

	                    <div className="flex items-center gap-1 rounded-xl border bg-background px-1.5 py-1">
	                      <Button
	                        type="button"
	                        variant="ghost"
	                        size="icon"
	                        className="h-8 w-8 rounded-lg"
	                        onClick={() => onDecrement(lineId)}
	                      >
	                        <Minus className="h-4 w-4" />
	                      </Button>
	                      <span className="w-7 text-center text-sm font-semibold">
	                        {line?.quantity || 0}
	                      </span>
	                      <Button
	                        type="button"
	                        variant="ghost"
	                        size="icon"
	                        className="h-8 w-8 rounded-lg"
	                        onClick={() => onIncrement(lineId)}
	                      >
	                        <Plus className="h-4 w-4" />
	                      </Button>
	                    </div>
	                  </div>

	                  <div className="text-right">
	                    <p className="text-[11px] font-semibold text-muted-foreground">Subtotal</p>
	                    <p className="text-sm font-semibold">{Formatter.amount(lineTotal)}</p>
	                  </div>
	                </div>
	              </div>
	            );
	          })
        ) : (
          <div className="rounded-xl border border-dashed bg-background/40 p-4 text-center">
            <p className="text-sm font-semibold">Cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add menu items to start an order.</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border bg-background/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-sm font-bold">{Formatter.amount(totals.totalAmount)}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{totals.totalItems} item(s) in cart</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl"
            disabled={!entries.length}
            onClick={() => onClear?.()}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl"
            disabled={!entries.length}
            onClick={() => {
              // UI-ready; backend order flow can be wired later.
            }}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomizeAddOnsDialog = ({
  open,
  mode,
  menu,
  selectedIds,
  onSelectedIdsChange,
  onOpenChange,
  onConfirm,
}) => {
  const recommended = useMemo(
    () => (Array.isArray(menu?.recommendedAddOns) ? menu.recommendedAddOns : []),
    [menu?.recommendedAddOns],
  );
  const selectedSet = useMemo(
    () => new Set((selectedIds || []).map((id) => String(id || "")).filter(Boolean)),
    [selectedIds],
  );

  const toggle = (addOnId) => {
    const id = String(addOnId || "");
    if (!id) return;
    if (selectedSet.has(id)) {
      onSelectedIdsChange((selectedIds || []).filter((entry) => String(entry || "") !== id));
      return;
    }
    onSelectedIdsChange([...(selectedIds || []), id]);
  };

  const selectedAddOns = useMemo(() => {
    const map = new Map(recommended.map((item) => [String(item?._id || ""), item]));
    return (selectedIds || [])
      .map((id) => map.get(String(id || "")))
      .filter(Boolean);
  }, [recommended, selectedIds]);

  const basePrice = Number(menu?.price) || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + (Number(item?.price) || 0), 0);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  <p className="text-xs font-semibold text-muted-foreground">{groupLabel(group)}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => {
                      const id = String(item?._id || "");
                      const checked = selectedSet.has(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggle(id)}
                          className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                            checked
                              ? "bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--card))] shadow-[inset_4px_0_0_var(--color-primary)]"
                              : "bg-background hover:bg-[color:color-mix(in_srgb,var(--primary)_5%,var(--card))]"
                          }`}
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggle(id)} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="truncate text-sm font-semibold">{item?.name}</span>
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
                        </button>
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
            onClick={() => onSelectedIdsChange([])}
            disabled={!selectedIds?.length}
          >
            Clear
          </Button>
          <Button type="button" className="h-10 rounded-xl" onClick={onConfirm}>
            {mode === "edit" ? "Update item" : "Add to order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function createCartLineId() {
  if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createCartSignature(menuId, addOnIds = []) {
  const normalizedMenuId = String(menuId || "");
  const normalized = (Array.isArray(addOnIds) ? addOnIds : [])
    .map((id) => String(id || ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return `${normalizedMenuId}::${normalized.join(",")}`;
}

function loadCashierCart() {
  try {
    const saved = localStorage.getItem("cashierCart");
    if (!saved) return { version: 2, lines: [] };
    const parsed = JSON.parse(saved);

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.lines)) {
      return { version: 2, lines: parsed.lines };
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const legacyLines = Object.entries(parsed)
        .map(([menuId, qty]) => {
          const quantity = Math.max(0, Number(qty) || 0);
          if (!menuId || !quantity) return null;
          const normalizedMenuId = String(menuId || "");
          return {
            id: createCartLineId(),
            menuId: normalizedMenuId,
            quantity,
            addOns: [],
            signature: createCartSignature(normalizedMenuId, []),
            updatedAt: 0,
          };
        })
        .filter(Boolean);
      return { version: 2, lines: legacyLines };
    }

    return { version: 2, lines: [] };
  } catch {
    return { version: 2, lines: [] };
  }
}

