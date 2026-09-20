import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Formatter, fullName } from "@/services/utilities";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Utensils,
  UsersRound,
  Wallet,
} from "lucide-react";
import { SERVICE_BADGES, STATUS_STYLES } from "../../constant";

const Approval = ({ isOpen, setIsOpen, selected = {} }) => {
  const booking = selected || {};
  const service = SERVICE_BADGES[booking.bookingType] || {
    label: "Booking",
    className: "border-border bg-muted/40 text-foreground",
  };
  const services = getServiceRows(booking);
  const payment = getPaymentSummary(booking);
  const customerName =
    fullName(booking?.customer?.fullName) || booking?.contact?.name || "Guest";
  const isCombinedBooking = booking.bookingType === "both";

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[820px] p-0">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate text-base">
                Approve Booking
              </DialogTitle>
              <DialogDescription>
                Review request details and allocations before approval.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          id="approval-form"
          onSubmit={handleSubmit}
          className="space-y-3 p-4"
        >
          <section className="rounded-md border bg-muted/15 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {booking.eventType || "Event booking"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {customerName}
                </p>
              </div>

              <Badge
                variant="outline"
                className={`capitalize ${STATUS_STYLES[booking.status]}`}
              >
                {booking.status || "pending"}
              </Badge>
            </div>

            <div
              className={`mt-3 grid grid-cols-2 gap-1.5 ${
                isCombinedBooking ? "md:grid-cols-5" : "md:grid-cols-4"
              }`}
            >
              <Metric
                icon={<CalendarDays className="size-3.5" />}
                label="Date"
                value={formatDate(booking.date)}
              />
              {isCombinedBooking ? (
                <>
                  <Metric
                    icon={<UsersRound className="size-3.5" />}
                    label="Catering Pax"
                    value={booking?.catering?.pax || 0}
                  />
                  <Metric
                    icon={<UsersRound className="size-3.5" />}
                    label="Venue Pax"
                    value={booking?.venue?.pax || 0}
                  />
                </>
              ) : (
                <Metric
                  icon={<UsersRound className="size-3.5" />}
                  label="Pax"
                  value={getTotalPax(booking)}
                />
              )}
              <Metric
                icon={<Wallet className="size-3.5" />}
                label="Total"
                value={Formatter.amount(payment.total)}
              />
              <Metric
                icon={<CheckCircle2 className="size-3.5" />}
                label="Type"
                value={service.label}
              />
            </div>
          </section>

          <section className="grid gap-2 md:grid-cols-2">
            <CompactPanel title="Customer">
              <InfoRow
                icon={<UsersRound className="size-3.5" />}
                label="Name"
                value={booking?.contact?.name}
              />
              <InfoRow
                icon={<Phone className="size-3.5" />}
                label="Phone"
                value={booking?.contact?.phone}
              />
              <InfoRow
                icon={<Mail className="size-3.5" />}
                label="Email"
                value={booking?.contact?.email}
              />
            </CompactPanel>

            <CompactPanel title="Payment">
              <InfoRow
                label="Received"
                value={Formatter.amount(payment.received)}
              />
              <InfoRow
                label="Balance"
                value={Formatter.amount(payment.balance)}
              />
              <InfoRow
                label="Status"
                value={payment.status}
                className="capitalize"
              />
            </CompactPanel>
          </section>

          <section className="grid gap-3">
            {services.map((item) => (
              <ServiceReview key={item.type} item={item} />
            ))}
          </section>

          <section className="grid gap-2 md:grid-cols-[minmax(0,1fr)_15rem]">
            <Textarea
              className="min-h-16 resize-none text-xs"
              placeholder="Approval note or allocation instruction..."
            />

            <div className="rounded-md border bg-muted/10 p-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Total</span>
                <span>{Formatter.amount(payment.total)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Balance</span>
                <span>{Formatter.amount(payment.balance)}</span>
              </div>
            </div>
          </section>
        </form>

        <DialogFooter className="border-t bg-muted/10 px-4 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="approval-form">
            <CheckCircle2 className="size-4" />
            Approve Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Approval;

const Metric = ({ icon, label, value }) => (
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

const CompactPanel = ({ title, children }) => (
  <section className="rounded-md border bg-background p-3">
    <SectionTitle title={title} />
    <div className="grid gap-1">{children}</div>
  </section>
);

const SectionTitle = ({ title }) => (
  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {title}
  </h3>
);

const InfoRow = ({ icon, label, value, className = "" }) => (
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

const ServiceReview = ({ item }) => (
  <section className="rounded-md border bg-background">
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-md border-b bg-background/95 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-md border bg-background ${item.accentClassName}`}
        >
          {item.icon}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{item.label}</h3>
          <p className="truncate text-[11px] text-muted-foreground">
            {item.name}
          </p>
        </div>
      </div>

      <Badge variant="outline" className="shrink-0 px-2.5 py-1 text-xs">
        {item.pax} pax
      </Badge>
    </div>

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
        <InclusionGroup label={item.label} items={item.inclusions} />
      </ServiceSection>

      {item.pricing && (
        <ServiceSection title="Pricing">
          <PricePanel label={item.label} pricing={item.pricing} />
        </ServiceSection>
      )}
    </div>
  </section>
);

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

const ServicePanel = ({ item }) => (
  <div className="grid gap-1 text-xs md:grid-cols-2">
    <DetailPill
      icon={<Clock3 className="size-3.5" />}
      value={`${Formatter.time(item.time?.start)} - ${Formatter.time(item.time?.end)}`}
    />
    <DetailPill
      icon={<MapPin className="size-3.5" />}
      value={item.location}
    />
  </div>
);

const DetailPill = ({ icon, value }) => (
  <span className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-2 py-1">
    <span className="shrink-0 text-muted-foreground">{icon}</span>
    <span className="truncate font-medium">{value || "-"}</span>
  </span>
);

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

const InclusionGroup = ({ label, items }) => {
  const sortedItems = [...(items || [])].sort((first, second) => {
    const firstRequiresInput = requiresResourceInput(first);
    const secondRequiresInput = requiresResourceInput(second);

    if (firstRequiresInput === secondRequiresInput) return 0;
    return firstRequiresInput ? -1 : 1;
  });

  return (
    <div>
      {sortedItems.length > 0 ? (
        <div className="grid gap-1.5 md:grid-cols-2">
          {sortedItems.map((inclusion, index) => (
            <InclusionAllocation
              key={inclusion?.item?._id || `${label}-${index}`}
              inclusion={inclusion}
            />
          ))}
        </div>
      ) : (
        <EmptyPanel label="No resources listed" />
      )}
    </div>
  );
};

const InclusionAllocation = ({ inclusion }) => {
  const needsInput = requiresResourceInput(inclusion);
  const isEquipment = inclusion?.model === "Equipment";
  const amount = Number(inclusion?.amount || 0);
  const available = 12;
  const unit = getResourceUnit(inclusion);

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-background px-2 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">
          {formatItemName(inclusion?.item)}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {isEquipment
            ? `${inclusion?.model || "Equipment"} / ${available} available`
            : inclusion?.model || "Item"}
        </p>
      </div>

      {needsInput && (
        <div className="flex items-center justify-end gap-1.5">
          <label className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {capitalizeLabel(unit)}
            </span>
            <Input
              type="number"
              min="0"
              defaultValue={amount || ""}
              className="h-7 w-16 px-2 text-xs"
            />
          </label>
        </div>
      )}

      {!needsInput && (
        <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
          <CheckCircle2 className="size-3 text-primary" />
          Included
        </span>
      )}
    </div>
  );
};

const PricePanel = ({ label, pricing }) => (
  <section className="rounded-md border bg-muted/10 p-2.5">
    <div className="mb-1 flex items-center justify-between text-xs font-semibold">
      <span>{label}</span>
      <span>{Formatter.amount(pricing.total || 0)}</span>
    </div>
    <PriceRow label="Base" value={pricing.basePrice} />
    <PriceRow label="Guest charge" value={pricing.guests?.charge} />
    <PriceRow label="Duration charge" value={pricing.duration?.charge} />
  </section>
);

const PriceRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs text-muted-foreground">
    <span>{label}</span>
    <span>{Formatter.amount(value || 0)}</span>
  </div>
);

const EmptyPanel = ({ label }) => (
  <div className="rounded-md border border-dashed bg-background px-3 py-5 text-center text-xs text-muted-foreground">
    {label}
  </div>
);

const getServiceRows = (booking) => {
  const rows = [];

  if (booking.bookingType === "catering" || booking.bookingType === "both") {
    rows.push({
      type: "catering",
      icon: <Utensils className="size-4 text-rose-700" />,
      name: booking?.catering?.item?.name || "Catering package",
      subtitle: "Food service",
      pax: booking?.catering?.pax || 0,
      time: booking?.catering?.time,
      label: "Catering",
      accentClassName: "border-l-2 border-l-rose-500",
      location:
        booking?.catering?.venue?.location ||
        booking?.catering?.venue?.address ||
        booking?.venue?.item?.address,
      mainDishes: booking?.catering?.mainDishes || [],
      sideDishes: booking?.catering?.sideDishes || [],
      inclusions: booking?.catering?.item?.inclusions || [],
      pricing: booking?.pricing?.catering,
    });
  }

  if (booking.bookingType === "venue" || booking.bookingType === "both") {
    rows.push({
      type: "venue",
      icon: <Building2 className="size-4 text-amber-700" />,
      name: booking?.venue?.item?.name || "Venue reservation",
      subtitle: booking?.venue?.item?.setting || "Event venue",
      pax: booking?.venue?.pax || 0,
      time: booking?.venue?.time,
      label: "Venue",
      accentClassName: "border-l-2 border-l-amber-500",
      location: booking?.venue?.item?.address,
      inclusions: booking?.venue?.item?.inclusions || [],
      pricing: booking?.pricing?.venue,
    });
  }

  if (rows.length === 0) {
    rows.push({
      type: "booking",
      icon: <Sparkles className="size-4 text-muted-foreground" />,
      name: "Booking details",
      subtitle: "No service details available",
      pax: 0,
      time: {},
      label: "Booking",
      accentClassName: "border-l-2 border-l-muted-foreground",
      location: "-",
      inclusions: [],
      pricing: null,
    });
  }

  return rows;
};

const getPaymentSummary = (booking) => {
  const total = Number(booking?.pricing?.total || 0);
  const received = Number(booking?.payment?.amount || 0);

  return {
    total,
    received,
    balance: Math.max(total - received, 0),
    status:
      booking?.payment?.status ||
      (received >= total && total > 0
        ? "paid"
        : received > 0
          ? "partial"
          : "unpaid"),
  };
};

const getTotalPax = (booking) => {
  if (booking.bookingType === "both") {
    return Math.max(
      Number(booking?.catering?.pax || 0),
      Number(booking?.venue?.pax || 0),
    );
  }

  return Number(booking?.[booking.bookingType]?.pax || 0);
};

const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

const formatItemName = (item) => {
  if (!item) return "-";
  if (typeof item === "string") return item;

  return item.name || item.title || item.description || "-";
};

const capitalizeLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getResourceUnit = (inclusion) => {
  if (inclusion?.model === "Equipment" && inclusion?.item?.unit) {
    return inclusion.item.unit;
  }

  const unit = getResourceRequirement(inclusion);

  return unit === "none" ? "Qty" : unit;
};

const requiresResourceInput = (inclusion) => {
  const unit = getResourceRequirement(inclusion);

  return ["qty", "hrs"].includes(unit);
};

const getResourceRequirement = (inclusion) =>
  String(
    inclusion?.unit ||
      inclusion?.item?.requirement ||
      (inclusion?.model === "Equipment" ? "qty" : "none"),
  ).toLowerCase();
