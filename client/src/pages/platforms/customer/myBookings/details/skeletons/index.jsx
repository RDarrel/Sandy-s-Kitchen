export const SkeletonBlock = ({ className }) => {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
};

export const SkeletonCard = ({ children, className = "" }) => {
  return (
    <section
      className={`overflow-hidden rounded-lg border bg-card ${className}`}
    >
      {children}
    </section>
  );
};

export const SkeletonSectionHeader = ({ withBadge = false }) => {
  return (
    <div className="flex h-10 items-center gap-2 border-b px-3">
      <SkeletonBlock className="size-6 shrink-0 rounded-md" />

      <SkeletonBlock className="h-4 w-36" />

      {withBadge && <SkeletonBlock className="ml-auto h-6 w-16 rounded-md" />}
    </div>
  );
};
