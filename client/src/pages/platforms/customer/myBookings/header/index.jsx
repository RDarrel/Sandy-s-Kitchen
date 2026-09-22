import { Input } from "@/components/ui/input";
import { CalendarDays, Search } from "lucide-react";
import Filters from "./filters";

const Header = ({
  query,
  filter,
  counts,
  setFilter = () => {},
  setQuery = () => {},
}) => {
  return (
    <header className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />

            <h1 className="text-lg font-semibold leading-tight tracking-tight">
              My Bookings
            </h1>
          </div>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Track your reservations, booking status, and payments.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference or booking..."
            className="h-8 bg-muted/20 pl-8 text-xs shadow-none"
          />
        </div>
      </div>

      <div className="border-t px-2 py-1.5">
        <Filters value={filter} counts={counts} onChange={setFilter} />
      </div>
    </header>
  );
};

export default Header;
