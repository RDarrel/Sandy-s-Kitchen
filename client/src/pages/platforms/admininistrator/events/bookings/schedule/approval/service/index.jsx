import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
} from "lucide-react";
import { Formatter } from "@/services/utilities";
import { formatItemName } from "../utils";
import { EmptyPanel } from "../components";
import { useCallback, useEffect, useMemo, useState } from "react";
import Dishes from "./dishes";

const Service = ({
  item,
  catering = null,
  conflicts = [],
  isBoth = false,
  isViewOnly = false,
  isPending = false,
  invalidDishTarget = null,
  handleDishPreparationChange = () => {},
}) => {
  const hasConflict = conflicts.length > 0 && item?.label === "Venue";
  const Icon = item.icon;
  const dishCount =
    (item?.mainDishes?.length || 0) + (item?.sideDishes?.length || 0);
  const scheduleLabel = Formatter?.bookingDateRange(item?.time);
  const [isServiceOpen, setIsServiceOpen] = useState(true);
  const [openDishMenuKey, setOpenDishMenuKey] = useState(null);
  const services = useMemo(() => {
    return (item?.inclusions || []).filter(({ model }) => model === "Services");
  }, [item.inclusions]);

  useEffect(() => {
    if (invalidDishTarget?.serviceType === item?.type) {
      setIsServiceOpen(true);
    }
  }, [invalidDishTarget, item?.type]);

  const handleDishKeyOpen = useCallback((value) => {
    setOpenDishMenuKey(value);
  }, []);

  return (
    <Collapsible
      open={isServiceOpen}
      onOpenChange={setIsServiceOpen}
      className="relative overflow-visible"
    >
      <section
        className={`rounded-md border bg-background ${
          hasConflict ? "border-destructive/30" : ""
        }`}
      >
        <CollapsibleTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className="group sticky top-0 z-10 flex cursor-pointer items-center justify-between gap-3 rounded-md bg-background px-3 py-2 text-left data-[state=open]:rounded-b-none data-[state=open]:border-b"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-md border bg-background ${item.accentClassName}`}
              >
                <Icon className={`size-4 ${item.iconClassName}`} />
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">
                    <span className="group-data-[state=open]:hidden">
                      {item.label} - {item.name}
                    </span>
                    <span className="hidden group-data-[state=open]:inline">
                      {item.label}
                    </span>
                  </h3>

                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />

                  {hasConflict && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <AlertTriangle className="size-3" />
                    </span>
                  )}
                </div>

                <p className="truncate text-[11px] text-muted-foreground">
                  <span className="group-data-[state=open]:hidden">
                    {scheduleLabel}
                    {item.type === "catering" && (
                      <>
                        {" "}
                        - {dishCount} {dishCount === 1 ? "dish" : "dishes"}
                      </>
                    )}
                  </span>
                  <span className="hidden group-data-[state=open]:inline">
                    {item.name}
                  </span>
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
        </CollapsibleTrigger>

        {/* Service Content */}
        <CollapsibleContent className="grid gap-2 p-3">
          <ServiceSection title="Details">
            <ServicePanel item={item} isBoth={isBoth} />
          </ServiceSection>

          {item.type === "catering" && (
            <ServiceSection
              title="Dish Preperation"
              count={item.mainDishes.length + item.sideDishes.length}
            >
              <div className="grid gap-2 items-start md:grid-cols-2">
                <Dishes
                  title="Main Dishes"
                  type="mainDishes"
                  items={item.mainDishes}
                  defaultServings={item.pax}
                  catering={catering}
                  isViewOnly={isViewOnly}
                  isPending={isPending}
                  openMenuKey={openDishMenuKey}
                  setOpenMenuKey={handleDishKeyOpen}
                  invalidDishTarget={invalidDishTarget}
                  handleDishPreparationChange={handleDishPreparationChange}
                />

                <Dishes
                  title="Side Dishes"
                  type="sideDishes"
                  items={item.sideDishes}
                  isViewOnly={isViewOnly}
                  isPending={isPending}
                  defaultServings={item.pax}
                  catering={catering}
                  openMenuKey={openDishMenuKey}
                  setOpenMenuKey={handleDishKeyOpen}
                  invalidDishTarget={invalidDishTarget}
                  handleDishPreparationChange={handleDishPreparationChange}
                />
              </div>
            </ServiceSection>
          )}

          {services?.length > 0 && (
            <ServiceSection title="Included Services" count={services.length}>
              <IncludedServicesPanel items={services} />
            </ServiceSection>
          )}
        </CollapsibleContent>
      </section>
    </Collapsible>
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
        value={Formatter?.bookingDateRange(item?.time)}
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

const IncludedServicesPanel = ({ items = [] }) => {
  if (!items.length) {
    return <EmptyPanel label="No services included" />;
  }

  return (
    <div className="grid gap-1.5 md:grid-cols-2">
      {items.map((service, index) => (
        <div
          key={
            service?.item?._id || `${formatItemName(service?.item)}-${index}`
          }
          className="flex min-w-0 items-center gap-2 rounded-md border bg-muted/10 px-2.5 py-2"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
            <CheckCircle2 className="size-3.5" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {formatItemName(service?.item)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

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
