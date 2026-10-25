import { PresetImage, fullName as formatFullName } from "@/services/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarCheck2, ChevronDown, LogOut } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchCustomer from "../admininistrator/events/bookings/calendar/header/search";

const CoordinatorTopbar = ({ searchProps }) => {
  const navigate = useNavigate();
  const { auth = {} } = useSelector(({ auth }) => auth);

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
    return fallback || "Booking coordinator";
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="sticky inset-x-0 top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid min-h-16 w-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,440px)_minmax(0,1fr)] lg:gap-x-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CalendarCheck2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight sm:text-base">
              Sandy&apos;s Kitchenette
            </p>
            <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Booking coordinator
            </p>
          </div>
        </div>

        <div className="col-span-2 row-start-2 min-w-0 pb-1 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:pb-0">
          <SearchCustomer {...searchProps} variant="topbar" />
        </div>

        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-3 sm:gap-5 lg:col-start-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 gap-2.5 rounded-xl px-1.5 sm:px-2.5"
                aria-label={`Open account menu for ${displayName}`}
              >
                <Avatar className="size-8 border border-border/70">
                  <AvatarImage
                    src={avatarSrc}
                    alt={auth?.email || displayName}
                  />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 text-left sm:block">
                  <span className="block truncate text-xs font-semibold">{displayName}</span>
                  <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">Coordinator</span>
                </span>
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
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
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default CoordinatorTopbar;
