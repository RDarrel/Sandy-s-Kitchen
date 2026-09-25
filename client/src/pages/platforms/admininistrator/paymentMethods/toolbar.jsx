import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SET_SEARCH,
  SET_STATUS,
} from "@/services/redux/slices/events/paymentMethods";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
const FILTERS = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
];

const Toolbar = () => {
  const { collections, isLoading, search, status } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );
  const dispatch = useDispatch();
  return (
    <div className="flex flex-col gap-4 border-b px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Payment Channels
        </h2>

        {isLoading ? (
          <Skeleton className="mt-1 h-3 w-28" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {collections.length} configured{" "}
            {collections.length === 1 ? "method" : "methods"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => dispatch(SET_SEARCH(event.target.value))}
            placeholder="Search payment methods..."
            className="h-10 pl-8 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex w-full gap-1 rounded-md border bg-background p-1 sm:w-auto">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => dispatch(SET_STATUS(item.value))}
              className={`h-8 flex-1 rounded px-3 text-xs font-medium transition-colors sm:flex-none ${
                status === item.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/15 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
