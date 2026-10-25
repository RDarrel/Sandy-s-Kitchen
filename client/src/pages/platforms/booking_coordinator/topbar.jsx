import { PresetImage, fullName as formatFullName } from "@/services/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ChefHat, LogOut } from "lucide-react";
import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CoordinatorTopbar = () => {
  const navigate = useNavigate();
  const { auth = {} } = useSelector(({ auth }) => auth);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-30 border-b bg-background"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-5 py-3 lg:px-10">
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

        <div className="flex items-center gap-2">
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
    </header>
  );
};

export default CoordinatorTopbar;
