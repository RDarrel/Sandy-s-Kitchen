import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
const Filters = ({ value, counts, onChange }) => {
  const { isLoadingMyBookings } = useSelector(({ bookings }) => bookings);
  const filters = [
    {
      value: "upcoming",
      label: "Upcoming",
      count: counts.upcoming,
    },
    {
      value: "pending",
      label: "Pending",
      count: counts.pending,
    },
    {
      value: "completed",
      label: "Completed",
      count: counts.completed,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: counts.cancelled,
    },
    {
      value: "all",
      label: "All",
      count: counts.all,
    },
  ];

  if (isLoadingMyBookings) return <FiltersSkeleton />;

  return (
    <div
      role="tablist"
      aria-label="Booking categories"
      className="flex min-w-0 gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {filters
        .filter(({ value }) => counts[value])
        .map((item) => {
          const isActive = value === item.value;

          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.value)}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition sm:gap-2 sm:px-3 sm:text-xs ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {item.label}

              <span
                className={`inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-4 sm:min-w-[18px] sm:px-1.5 sm:text-[10px] ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.count || 0}
              </span>
            </button>
          );
        })}
    </div>
  );
};

export default Filters;

const FiltersSkeleton = () => {
  const filters = [
    {
      value: "upcoming",
      labelWidth: "w-[52px]",
    },
    {
      value: "pending",
      labelWidth: "w-[43px]",
    },
    {
      value: "completed",
      labelWidth: "w-[59px]",
    },
    {
      value: "cancelled",
      labelWidth: "w-[57px]",
    },
    {
      value: "all",
      labelWidth: "w-[17px]",
    },
  ];

  return (
    <div className="flex min-w-0 gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {filters.map((item) => (
        <div
          key={item.value}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 sm:gap-2 sm:px-3"
        >
          {/* Label */}
          <Skeleton className={`h-[11px] ${item.labelWidth} rounded sm:h-3`} />

          {/* Count */}
          <Skeleton className="h-4 min-w-4 rounded-full sm:min-w-[18px]" />
        </div>
      ))}
    </div>
  );
};
