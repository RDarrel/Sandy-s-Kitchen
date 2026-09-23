import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Building2, Clock3, MapPin } from "lucide-react";
import ConflictPanel from "./conflictPanel";
import { Formatter } from "@/services/utilities";
import { formatItemName } from "../utils";
import Inclusions from "../inclusions";
import { EmptyPanel, SectionTitle } from "../components";

const Service = ({
  item,
  conflicts = [],
  isBoth = false,
  handleInclusionAmountChange = () => {},
}) => {
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
            <ServicePanel item={item} isBoth={isBoth} />
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
            <Inclusions
              label={item.label}
              serviceType={item?.type}
              items={item.inclusions}
              handleInclusionAmountChange={handleInclusionAmountChange}
            />
          </ServiceSection>

          {item.pricing && (
            <ServiceSection title="Pricing">
              <PricePanel label={item.label} pricing={item.pricing} />
            </ServiceSection>
          )}
        </div>
      </section>

      {/* Floating Conflict Panel */}
      {hasConflict && <ConflictPanel service={item} conflicts={conflicts} />}
    </div>
  );
};
export default Service;

const ServiceSection = ({ title, count, children }) => (
  <div className="grid gap-1.5">
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-border" />

      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}

        {typeof count === "number" && (
          <span className="rounded-full border bg-background px-1.5 py-0 text-[10px] leading-4">
            {count}
          </span>
        )}
      </span>

      <span className="h-px flex-1 bg-border" />
    </div>

    {children}
  </div>
);

const ServicePanel = ({ item, isBoth }) => {
  const isCateringOnly = item?.type === "catering" && !isBoth;

  return (
    <div
      className={`grid gap-1 text-xs ${
        isCateringOnly ? "md:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      <DetailPill
        icon={<Clock3 className="size-3.5" />}
        value={`${Formatter.time(item?.time?.start)} - ${Formatter.time(
          item?.time?.end,
        )}`}
      />

      {isCateringOnly && (
        <DetailPill
          icon={<Building2 className="size-3.5" />}
          value={item?.location}
        />
      )}

      <DetailPill
        icon={<MapPin className="size-3.5" />}
        value={isCateringOnly ? item?.address : item?.location}
      />
    </div>
  );
};

const DetailPill = ({ icon, value }) => (
  <span className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1">
    <span className="shrink-0 text-muted-foreground">{icon}</span>

    <span className="truncate font-medium">{value || "-"}</span>
  </span>
);

/*
|--------------------------------------------------------------------------
| MENU PANEL
|--------------------------------------------------------------------------
*/

const MenuPanel = ({ title, items }) => (
  <section className="rounded-md border bg-muted/10 p-2.5">
    <SectionTitle title={title} />

    {items.length > 0 ? (
      <div className="grid gap-1">
        {items.map((item) => (
          <div
            key={item?._id || formatItemName(item)}
            className="rounded-md border bg-background px-2 py-1 text-xs font-medium"
          >
            {formatItemName(item)}
          </div>
        ))}
      </div>
    ) : (
      <EmptyPanel label={`No ${title.toLowerCase()} selected`} />
    )}
  </section>
);

export const PricePanel = ({ label, pricing }) => {
  const rows = getPricingRows(pricing);

  return (
    <section className="rounded-md border bg-muted/10 p-2.5">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
        <span>{label}</span>

        <span>{Formatter.amount(pricing.total || 0)}</span>
      </div>

      <div className="grid gap-0.5">
        {rows.map((row) => (
          <PriceRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
    </section>
  );
};

export const PriceRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>{label}</span>

    <span>{Formatter.amount(value || 0)}</span>
  </div>
);

const getPricingRows = (pricing = {}) => {
  const rows = [];
  const basePrice = Number(pricing?.basePrice || 0);
  const guestCharge = Number(pricing?.guests?.charge || 0);
  const durationCharge = Number(pricing?.duration?.charge || 0);
  const extraGuests = getExtraGuests(pricing?.guests);
  const extraDuration = getExtraDuration(pricing?.duration);

  if (basePrice > 0) {
    rows.push({
      label: "Base price",
      value: basePrice,
    });
  }

  if (extraGuests > 0 && guestCharge > 0) {
    rows.push({
      label: `Extra guests (${extraGuests})`,
      value: guestCharge,
    });
  }

  if (extraDuration > 0 && durationCharge > 0) {
    rows.push({
      label: `Extra duration (${formatHours(extraDuration)})`,
      value: durationCharge,
    });
  }

  return rows;
};

const getExtraGuests = (guests = {}) => {
  const extra = Number(guests?.extra || 0);

  if (extra > 0) return extra;

  return Math.max(
    Number(guests?.booked || 0) - Number(guests?.included || 0),
    0,
  );
};

const getExtraDuration = (duration = {}) => {
  const extra = Number(duration?.extra || 0);

  if (extra > 0) return extra;

  return Math.max(
    Number(duration?.booked || 0) - Number(duration?.included || 0),
    0,
  );
};

const formatHours = (hours) => `${hours} hr${hours === 1 ? "" : "s"}`;
