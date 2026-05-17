import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEARCH as SEARCH_MENUS } from "@/services/redux/slices/stations/cashier";
import { Search, SearchX, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const CashierNoResults = () => {
  const dispatch = useDispatch();
  const { search = "" } = useSelector(({ cashier }) => cashier);

  const trimmed = String(search || "").trim();
  const hasSearch = Boolean(trimmed);

  if (!hasSearch) return null;

  return (
    <Card className="col-span-full overflow-hidden rounded-2xl border bg-[color:color-mix(in_srgb,var(--primary)_7%,var(--card))] shadow-sm">
      <div className="flex flex-col items-center justify-center gap-5 px-6 py-10 text-center sm:px-10">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-background/85 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--primary)_12%,var(--background))]">
              <SearchX className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-semibold tracking-tight">
            No matching menu items
          </p>
          <p className="mx-auto max-w-[38rem] text-sm text-muted-foreground">
            We couldn&apos;t find any items for{" "}
            <Badge variant="secondary" className="rounded-full align-middle">
              “{trimmed}”
            </Badge>
            . Check spelling or use fewer words.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {["sisig", "halo", "chicken"].map((value) => (
            <Button
              key={value}
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full px-3 text-xs font-semibold"
              onClick={() => dispatch(SEARCH_MENUS(value))}
            >
              {value}
            </Button>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-2">
          <Button
            type="button"
            className="h-10 w-full rounded-xl"
            onClick={() => dispatch(SEARCH_MENUS(""))}
          >
            <X className="h-4 w-4" />
            Clear search
          </Button>
          <p className="text-xs text-muted-foreground">
            Tip: use 1–2 keywords for faster matches.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CashierNoResults;
