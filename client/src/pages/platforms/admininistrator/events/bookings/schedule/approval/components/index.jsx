/*
|--------------------------------------------------------------------------
| EMPTY PANEL
|--------------------------------------------------------------------------
*/

export const EmptyPanel = ({ label }) => (
  <div className="rounded-md border border-dashed bg-background px-3 py-5 text-center text-xs text-muted-foreground">
    {label}
  </div>
);

export const Metric = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background p-2">
    <span className="shrink-0 text-muted-foreground">{icon}</span>

    <span className="min-w-0">
      <span className="block truncate text-[10px] leading-3 text-muted-foreground">
        {label}
      </span>

      <span className="block truncate text-xs font-semibold">
        {value || "-"}
      </span>
    </span>
  </div>
);

export const CompactPanel = ({ title, children }) => (
  <section className="rounded-md border bg-background p-3">
    <SectionTitle title={title} />

    <div className="grid gap-1">{children}</div>
  </section>
);

export const SectionTitle = ({ title }) => (
  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {title}
  </h3>
);

export const InfoRow = ({ icon, label, value, className = "" }) => (
  <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2 text-xs">
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      {label}
    </span>

    <span className={`truncate font-medium text-foreground ${className}`}>
      {value || "-"}
    </span>
  </div>
);
