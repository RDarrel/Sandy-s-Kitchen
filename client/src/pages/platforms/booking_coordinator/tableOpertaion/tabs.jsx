import { useSelector } from "react-redux";
import { STATUSES } from "./constant";
import { STATUS_DOTS } from "../../admininistrator/events/bookings/constant";

const Tabs = ({ status, setStatus = () => {}, setPage = () => {} }) => {
  const { counts } = useSelector(({ bookings }) => bookings);
  return (
    <div className="flex min-w-0 flex-col xl:flex-row xl:items-end xl:gap-5">
      <div className="relative z-10 order-2 min-w-0 overflow-x-auto xl:order-1 xl:shrink-0">
        <div
          role="group"
          aria-label="Filter bookings by status"
          className="flex w-max items-end gap-0.5 pt-1"
        >
          {STATUSES.map(({ value, label }, index) => {
            const active = status === value;
            const count = counts[value] ? counts[value] : 0;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
                className={`relative inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg border px-3.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none ${active ? "border-primary/40 border-b-card bg-card font-semibold text-primary" : "border-transparent font-medium text-muted-foreground hover:text-primary"}`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full ${STATUS_DOTS[value] || "bg-primary"}`}
                />
                {label}
                {count > 0 && (
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {count}
                  </span>
                )}
                {!active &&
                  index < STATUSES.length - 1 &&
                  STATUSES[index + 1].value !== status && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-0.5 top-1/2 h-4 -translate-y-1/2 border-r border-border"
                    />
                  )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tabs;
