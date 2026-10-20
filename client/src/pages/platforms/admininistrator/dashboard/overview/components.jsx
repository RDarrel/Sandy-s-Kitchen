import { Button } from "@/components/ui/button";

export const DashboardFeedback = ({ error, onRetry }) => (
  <div
    role="alert"
    className="flex min-h-[260px] flex-1 flex-col items-center justify-center gap-3 px-5 py-6 text-center"
  >
    <p className="text-sm font-medium">Could not load this section</p>
    <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try Again
    </Button>
  </div>
);

export const CollectionsDonutSkeleton = () => (
  <div
    role="status"
    aria-label="Loading collections by source"
    className="mx-auto h-[260px] w-full max-w-[300px]"
  >
    <svg
      viewBox="0 0 300 260"
      className="h-full w-full animate-pulse motion-reduce:animate-none"
      aria-hidden="true"
    >
      <circle
        cx="150"
        cy="130"
        r="93"
        fill="none"
        stroke="var(--skeleton)"
        strokeWidth="34"
        strokeDasharray="365 4 211 4"
        transform="rotate(-90 150 130)"
      />
      <rect
        x="98"
        y="114"
        width="104"
        height="17"
        rx="4"
        fill="var(--skeleton)"
      />
      <rect
        x="112"
        y="141"
        width="76"
        height="9"
        rx="3"
        fill="var(--skeleton)"
      />
    </svg>
  </div>
);

export const DashboardEmptyState = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/25 text-muted-foreground">
        <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-[240px] text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
};
