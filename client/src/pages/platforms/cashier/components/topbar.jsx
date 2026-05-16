import {
  Formatter,
  PresetImage,
  fullName as formatFullName,
} from "@/services/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, LogOut, ShoppingCart, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  SetActiveTab,
  SetCartOpen,
} from "@/services/redux/slices/stations/cashier";

const CashierTopbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth = {} } = useSelector(({ auth }) => auth);
  const { activeTab: topbarTab = "menus", cart } = useSelector(
    ({ cashier }) => cashier,
  );

  const headerRef = useRef(null);

  const displayName = useMemo(() => {
    const obj =
      auth?.fullName && typeof auth.fullName === "object"
        ? auth.fullName
        : null;
    if (obj) {
      const formatted = formatFullName(obj);
      if (
        formatted &&
        formatted !== "Datatype mismatch" &&
        formatted !== "Incomplete"
      )
        return formatted;
    }

    const fallback = [auth?.fname, auth?.lname].filter(Boolean).join(" ");
    return fallback || "Cashier";
  }, [auth]);

  const isMale = useMemo(() => {
    if (typeof auth?.isMale === "boolean") return auth.isMale;
    const normalized = String(auth?.sex || auth?.gender || "").toLowerCase();
    if (!normalized) return false;
    return normalized === "male" || normalized === "m";
  }, [auth]);

  const avatarSrc = useMemo(() => {
    const explicit = auth?.img || auth?.avatar || "";
    if (explicit) return explicit;
    return PresetImage(Boolean(isMale));
  }, [auth, isMale]);

  const initials = useMemo(() => {
    const raw = String(displayName || "").trim();
    if (!raw) return "?";
    const cleaned = raw.replace(/[()]/g, "").replace(/\s+/g, " ");
    const parts = cleaned
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const first = parts[0]?.[0] || "?";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${last}`.toUpperCase();
  }, [displayName]);

  const cartTotals = useMemo(() => {
    const lines = Array.isArray(cart) ? cart : [];
    const totalItems = lines.reduce(
      (sum, line) => sum + (Number(line?.quantity) || 0),
      0,
    );
    return { totalItems };
  }, [cart]);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof window === "undefined") return;

    const root = document.documentElement;
    const update = () => {
      const next = Math.round(el.getBoundingClientRect()?.height || 0);
      if (next) root.style.setProperty("--cashier-topbar-height", `${next}px`);
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

  const setTopbarTab = useCallback(
    (value) => dispatch(SetActiveTab(value)),
    [dispatch],
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-30 border-b bg-background"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight sm:text-base">
              Sandy&apos;s Kitchenette
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              Cashier station
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Tabs
            value={topbarTab}
            onValueChange={setTopbarTab}
            className="w-fit"
          >
            <TabsList className="h-10 rounded-xl border bg-card/70 p-1 shadow-sm backdrop-blur">
              <TabsTrigger
                value="menus"
                className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:font-bold data-[state=active]:shadow-sm"
              >
                <ChefHat className="h-4 w-4" />
                Menus
              </TabsTrigger>

              <TabsTrigger
                value="sales"
                className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:font-bold data-[state=active]:shadow-sm"
              >
                <TrendingUp className="h-4 w-4" />
                Sales
                <Badge
                  variant="secondary"
                  className={`ml-1 h-5 rounded-full border-0 px-2 text-[10px] font-semibold leading-5 ${
                    topbarTab === "sales"
                      ? "bg-accent-foreground/15 text-accent-foreground"
                      : "bg-background/80 text-foreground"
                  }`}
                >
                  {`${Formatter.amount(1000)}+`}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            data-cashier-cart-button
            type="button"
            variant="outline"
            className="relative h-10 rounded-xl lg:hidden"
            onClick={() => dispatch(SetCartOpen(true))}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartTotals.totalItems > 0 && (
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                {cartTotals.totalItems}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 rounded-xl px-2 min-w-40"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={avatarSrc}
                    alt={auth?.email || displayName}
                  />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {displayName}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={avatarSrc}
                      alt={auth?.email || displayName}
                    />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
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
        <Tabs value={topbarTab} onValueChange={setTopbarTab} className="w-full">
          <TabsList className="h-10 w-full rounded-xl border bg-card/70 p-1 shadow-sm backdrop-blur">
            <TabsTrigger
              value="menus"
              className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:font-bold data-[state=active]:shadow-sm"
            >
              <ChefHat className="h-4 w-4" />
              Menus
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="h-8 rounded-lg px-3 text-xs font-semibold text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:font-bold data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Sales
              <Badge
                variant="secondary"
                className={`ml-1 h-5 rounded-full border-0 px-2 text-[10px] font-semibold leading-5 ${
                  topbarTab === "sales"
                    ? "bg-accent-foreground/15 text-accent-foreground"
                    : "bg-background/80 text-foreground"
                }`}
              >
                {`${Formatter.amount(1000)}+`}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};

export default CashierTopbar;
