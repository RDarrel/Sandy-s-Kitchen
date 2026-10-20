import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const ReportLink = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {children}
  </Link>
);

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
