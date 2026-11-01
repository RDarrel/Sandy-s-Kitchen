import { useSelector } from "react-redux";
import { useLayoutEffect, useRef, useState } from "react";
import { STATUSES } from "./constant";
import { STATUS_DOTS } from "../../admininistrator/events/bookings/constant";

const Tabs = ({ status, setStatus = () => {}, setPage = () => {} }) => {
  const { counts } = useSelector(({ bookings }) => bookings);
  const tabsRef = useRef(null);
  const [highlight, setHighlight] = useState(null);

  useLayoutEffect(() => {
    const group = tabsRef.current;
    const updateHighlight = () => {
      const activeTab = group?.querySelector('button[aria-pressed="true"]');
      if (!activeTab) return;
      const next = {
        left: activeTab.offsetLeft,
        top: activeTab.offsetTop,
        width: activeTab.offsetWidth,
        height: activeTab.offsetHeight,
      };
      setHighlight((previous) =>
        previous && Object.keys(next).every((key) => previous[key] === next[key])
          ? previous
          : next,
      );
    };

    updateHighlight();
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateHighlight);
    if (group) {
      observer?.observe(group);
      group.querySelectorAll("button").forEach((tab) => observer?.observe(tab));
    }
    window.addEventListener("resize", updateHighlight);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHighlight);
    };
  }, [status, counts]);

  return (
    <div className="flex min-w-0 flex-col xl:flex-row xl:items-end xl:gap-5">
      <div className="relative z-10 order-2 min-w-0 overflow-x-auto xl:order-1 xl:shrink-0">
        <div
          ref={tabsRef}
          role="group"
          aria-label="Filter bookings by status"
          className="relative isolate flex w-max items-end gap-0.5 pt-1"
        >
          {highlight && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 rounded-t-lg border border-primary/40 border-b-card bg-card transition-[transform,width,height] duration-250 ease-out motion-reduce:transition-none"
              style={{
                width: highlight.width,
                height: highlight.height,
                transform: `translate3d(${highlight.left}px, ${highlight.top}px, 0)`,
              }}
            />
          )}
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
                className={`relative z-10 inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-t-lg border border-transparent px-3.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none ${active ? "font-semibold text-primary" : "font-medium text-muted-foreground hover:text-primary"}`}
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
