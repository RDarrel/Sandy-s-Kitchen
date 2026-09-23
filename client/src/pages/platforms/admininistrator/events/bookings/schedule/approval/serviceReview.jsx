import { Badge } from "@/components/ui/badge";

const ServiceReview = ({ item, conflicts = [] }) => {
  const hasConflict = conflicts.length > 0;
  const Icon = item.icon;
  return (
    <div className="relative overflow-visible">
      <section
        className={`rounded-md border bg-background ${
          hasConflict ? "border-destructive/30" : ""
        }`}
      >
        {/* Service Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-md border-b bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-md border bg-background ${item.accentClassName}`}
            >
              <Icon className={`size-4 ${item.iconClassName}`} />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{item.label}</h3>

                {hasConflict && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-3" />
                  </span>
                )}
              </div>

              <p className="truncate text-[11px] text-muted-foreground">
                {item.name}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {hasConflict && (
              <Badge
                variant="outline"
                className="border-destructive/30 bg-destructive/5 text-[10px] text-destructive"
              >
                {conflicts.length}{" "}
                {conflicts.length === 1 ? "conflict" : "conflicts"}
              </Badge>
            )}

            <Badge variant="outline" className="shrink-0 px-2.5 py-1 text-xs">
              {item.pax} pax
            </Badge>
          </div>
        </div>

        {/* Service Content */}
        <div className="grid gap-2 p-3">
          <ServiceSection title="Details">
            <ServicePanel item={item} />
          </ServiceSection>

          {item.type === "catering" && (
            <ServiceSection
              title="Menu Choices"
              count={item.mainDishes.length + item.sideDishes.length}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <MenuPanel title="Main Dishes" items={item.mainDishes} />

                <MenuPanel title="Side Dishes" items={item.sideDishes} />
              </div>
            </ServiceSection>
          )}

          <ServiceSection title="Resources" count={item.inclusions.length}>
            <Inclusions label={item.label} items={item.inclusions} />
          </ServiceSection>

          {item.pricing && (
            <ServiceSection title="Pricing">
              <PricePanel label={item.label} pricing={item.pricing} />
            </ServiceSection>
          )}
        </div>
      </section>

      {/* Floating Conflict Panel */}
      {hasConflict && (
        <FloatingConflictPanel service={item} conflicts={conflicts} />
      )}
    </div>
  );
};

export default ServiceReview;
