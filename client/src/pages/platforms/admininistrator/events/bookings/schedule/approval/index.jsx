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
  AlertTriangle,
  ArrowUpRight,
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

/*
|--------------------------------------------------------------------------
| STATIC CONFLICT DATA
|--------------------------------------------------------------------------
|
| Temporary static data for UI testing.
|
| Catering = 2 conflicts
| Venue    = 5 conflicts
|
*/

const STATIC_CONFLICTS = {
  catering: [
    {
      _id: "conflict-catering-1",
      reference: "BK-2026-00128",
      eventType: "Corporate Event",
      customer: "Maria Santos",
      status: "approved",
      time: {
        start: "16:00",
        end: "20:00",
      },
      overlap: {
        start: "16:00",
        end: "19:00",
      },
    },
    {
      _id: "conflict-catering-2",
      reference: "BK-2026-00129",
      eventType: "Birthday Celebration",
      customer: "Andrea Reyes",
      status: "confirmed",
      time: {
        start: "18:00",
        end: "21:00",
      },
      overlap: {
        start: "18:00",
        end: "19:00",
      },
    },
  ],

  venue: [
    {
      _id: "conflict-venue-1",
      reference: "BK-2026-00131",
      eventType: "Wedding Reception",
      customer: "John Reyes",
      status: "confirmed",
      time: {
        start: "17:00",
        end: "22:00",
      },
      overlap: {
        start: "17:00",
        end: "20:00",
      },
    },
    {
      _id: "conflict-venue-2",
      reference: "BK-2026-00134",
      eventType: "Birthday Celebration",
      customer: "Angela Cruz",
      status: "approved",
      time: {
        start: "19:30",
        end: "23:00",
      },
      overlap: {
        start: "19:30",
        end: "20:00",
      },
    },
    {
      _id: "conflict-venue-3",
      reference: "BK-2026-00138",
      eventType: "Debut Celebration",
      customer: "Sophia Mendoza",
      status: "confirmed",
      time: {
        start: "14:00",
        end: "18:00",
      },
      overlap: {
        start: "14:00",
        end: "18:00",
      },
    },
    {
      _id: "conflict-venue-4",
      reference: "BK-2026-00141",
      eventType: "Company Anniversary",
      customer: "Daniel Garcia",
      status: "approved",
      time: {
        start: "15:30",
        end: "19:30",
      },
      overlap: {
        start: "15:30",
        end: "19:30",
      },
    },
    {
      _id: "conflict-venue-5",
      reference: "BK-2026-00146",
      eventType: "Family Reunion",
      customer: "Patricia Ramos",
      status: "confirmed",
      time: {
        start: "18:30",
        end: "22:30",
      },
      overlap: {
        start: "18:30",
        end: "20:00",
      },
    },
  ],
};

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

  const hasConflicts = services.some(
    (item) => (STATIC_CONFLICTS[item.type] || []).length > 0,
  );

  const totalConflicts = services.reduce(
    (total, item) => total + (STATIC_CONFLICTS[item.type] || []).length,
    0,
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (hasConflicts) return;

    // Approval logic here.
  };

  const handleConflictWheel = (e) => {
    const panel = e.currentTarget;

    const isAtTop = panel.scrollTop <= 0;

    const isAtBottom =
      Math.ceil(panel.scrollTop + panel.clientHeight) >= panel.scrollHeight;

    const scrollingUp = e.deltaY < 0;
    const scrollingDown = e.deltaY > 0;

    const shouldScrollParent =
      (isAtTop && scrollingUp) || (isAtBottom && scrollingDown);

    if (!shouldScrollParent) return;

    const dialog = panel.closest('[role="dialog"]');

    if (!dialog) return;

    dialog.scrollTop += e.deltaY;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={`
    w-[calc(100%-2rem)]
    overflow-visible
    !border-0
    bg-transparent
    p-0
    shadow-none
    !outline-none
    !ring-0

    focus:!outline-none
    focus:!ring-0

    focus-visible:!outline-none
    focus-visible:!ring-0

  ${
    hasConflicts
      ? "xl:grid xl:w-fit xl:max-w-none xl:grid-cols-[790px_310px] xl:gap-6 [&>button]:xl:right-[320px]"
      : "xl:w-[820px] xl:max-w-[820px]"
  }
  `}
      >
        <div className="w-full overflow-visible rounded-lg border bg-background shadow-lg xl:w-[820px]">
          <DialogHeader className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="truncate text-base">
                    Approve Booking
                  </DialogTitle>

                  {hasConflicts && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-destructive/30 bg-destructive/5 text-destructive"
                    >
                      <AlertTriangle className="size-3" />
                      {totalConflicts}{" "}
                      {totalConflicts === 1 ? "conflict" : "conflicts"}
                    </Badge>
                  )}
                </div>

                <DialogDescription>
                  {hasConflicts
                    ? "Review the detected schedule conflicts before approval."
                    : "Review request details and allocations before approval."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="approval-form"
            onSubmit={handleSubmit}
            className="space-y-3 p-4"
          >
            {/* Booking Summary */}
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

            {/* Customer + Payment */}
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

            {/* Services */}
            <section className="grid gap-3">
              {services.map((item) => (
                <ServiceReview
                  key={item.type}
                  item={item}
                  conflicts={STATIC_CONFLICTS[item.type] || []}
                />
              ))}
            </section>

            {/* Approval Note + Total */}
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

          {/* Footer */}
          <DialogFooter className="border-t bg-muted/10 px-4 py-3">
            {hasConflicts && (
              <div className="mr-auto flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />

                <span>Resolve schedule conflicts before approval.</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" form="approval-form" disabled={hasConflicts}>
              <CheckCircle2 className="size-4" />
              Approve Booking
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Approval;

/*
|--------------------------------------------------------------------------
| METRIC
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| COMPACT PANEL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| INFO ROW
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SERVICE REVIEW
|--------------------------------------------------------------------------
*/

const ServiceReview = ({ item, conflicts = [] }) => {
  const hasConflict = conflicts.length > 0;

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
              {item.icon}
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
            <InclusionGroup label={item.label} items={item.inclusions} />
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

/*
|--------------------------------------------------------------------------
| FLOATING CONFLICT PANEL
|--------------------------------------------------------------------------
|
| XL / Desktop
|
| Service card       Conflict panel
|
| ┌─────────────┐      ┌──────────────────┐
| │ Catering    │ ●━━━━●│ Conflict         │
| └─────────────┘      └──────────────────┘
|
| - 24px gap
| - 2px visible connector
| - dots on both ends
| - floating shadow
| - sticky while service section is visible
|
| Smaller screens
|
| - Goes below the service
| - No floating shadow
| - No connector
|
*/

const FloatingConflictPanel = ({ service, conflicts = [] }) => {
  return (
    <div
      className="
        mt-2
        xl:absolute
        xl:left-[calc(100%+1.5rem)]
        xl:top-0
        xl:z-50
        xl:mt-0
        xl:h-full
        xl:w-[310px]
      "
    >
      <div
        className="
          relative
          rounded-lg
          border
          border-destructive/25
          bg-background
          xl:sticky
          xl:top-4
          xl:shadow-xl
        "
      >
        {/* Visible Connector - Desktop Only */}
        <div className="absolute -left-6 top-5 z-20 hidden h-4 w-6 -translate-y-1/2 items-center xl:flex">
          {/* Connector Line */}
          <span className="absolute inset-x-0 h-0.5 rounded-full bg-destructive/60" />

          {/* Dot Near Service Card */}
          <span className="absolute left-0 size-2 -translate-x-1/2 rounded-full border-2 border-background bg-destructive" />

          {/* Dot Near Conflict Panel */}
          <span className="absolute right-0 size-2 translate-x-1/2 rounded-full border-2 border-background bg-destructive" />
        </div>

        {/* Conflict Header */}
        <div className="rounded-t-lg border-b border-destructive/15 bg-destructive/[0.035] px-3 py-2.5">
          <div className="flex items-start gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-destructive">
                  {service.label} Conflict
                </p>

                <Badge
                  variant="outline"
                  className="h-5 shrink-0 border-destructive/20 bg-background px-1.5 text-[9px] text-destructive"
                >
                  {conflicts.length}
                </Badge>
              </div>

              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                {conflicts.length === 1
                  ? "An existing booking overlaps this schedule."
                  : `${conflicts.length} existing bookings overlap this schedule.`}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Conflict List */}
        <div className="max-h-[280px] overflow-y-auto  [scrollbar-width:thin]">
          {conflicts.map((conflict, index) => (
            <ConflictBooking
              key={conflict._id}
              conflict={conflict}
              showDivider={index !== conflicts.length - 1}
            />
          ))}
        </div>

        {/* Conflict Footer */}
        <div className="rounded-b-lg border-t bg-muted/20 px-3 py-2">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-3 shrink-0 text-destructive" />

            <p className="text-[10px] leading-4 text-muted-foreground">
              This {service.label.toLowerCase()} schedule must be changed before
              the booking can be approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| CONFLICT BOOKING
|--------------------------------------------------------------------------
*/

const ConflictBooking = ({ conflict, showDivider = false }) => {
  return (
    <div className={`p-3 ${showDivider ? "border-b" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold">
              {conflict.reference}
            </span>

            <Badge
              variant="outline"
              className={`h-5 px-1.5 text-[9px] capitalize ${
                STATUS_STYLES[conflict.status] || ""
              }`}
            >
              {conflict.status}
            </Badge>
          </div>

          <p className="mt-1 truncate text-xs font-semibold">
            {conflict.eventType}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {conflict.customer}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-[10px]"
        >
          View
          <ArrowUpRight className="size-3" />
        </Button>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-1.5">
        {/* Existing Booking Time */}
        <div className="rounded-md border bg-muted/10 px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
            <Clock3 className="size-2.5" />
            Existing
          </div>

          <p className="mt-1 whitespace-nowrap text-[10px] font-semibold">
            {Formatter.time(conflict.time.start)} -{" "}
            {Formatter.time(conflict.time.end)}
          </p>
        </div>

        {/* Overlap Time */}
        <div className="rounded-md border border-destructive/20 bg-destructive/[0.04] px-2 py-1.5">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-destructive">
            <AlertTriangle className="size-2.5" />
            Overlap
          </div>

          <p className="mt-1 whitespace-nowrap text-[10px] font-semibold text-destructive">
            {Formatter.time(conflict.overlap.start)} -{" "}
            {Formatter.time(conflict.overlap.end)}
          </p>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| SERVICE SECTION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| SERVICE PANEL
|--------------------------------------------------------------------------
*/

const ServicePanel = ({ item }) => (
  <div className="grid gap-1 text-xs md:grid-cols-2">
    <DetailPill
      icon={<Clock3 className="size-3.5" />}
      value={`${Formatter.time(item.time?.start)} - ${Formatter.time(
        item.time?.end,
      )}`}
    />

    <DetailPill icon={<MapPin className="size-3.5" />} value={item.location} />
  </div>
);

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

/*
|--------------------------------------------------------------------------
| INCLUSION GROUP
|--------------------------------------------------------------------------
*/

const InclusionGroup = ({ label, items }) => {
  const sortedItems = [...(items || [])].sort((first, second) => {
    const firstRequiresInput = requiresResourceInput(first);
    const secondRequiresInput = requiresResourceInput(second);

    if (firstRequiresInput === secondRequiresInput) {
      return 0;
    }

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

/*
|--------------------------------------------------------------------------
| INCLUSION ALLOCATION
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| PRICE PANEL
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| EMPTY PANEL
|--------------------------------------------------------------------------
*/

const EmptyPanel = ({ label }) => (
  <div className="rounded-md border border-dashed bg-background px-3 py-5 text-center text-xs text-muted-foreground">
    {label}
  </div>
);

/*
|--------------------------------------------------------------------------
| GET SERVICE ROWS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| PAYMENT SUMMARY
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| TOTAL PAX
|--------------------------------------------------------------------------
*/

const getTotalPax = (booking) => {
  if (booking.bookingType === "both") {
    return Math.max(
      Number(booking?.catering?.pax || 0),
      Number(booking?.venue?.pax || 0),
    );
  }

  return Number(booking?.[booking.bookingType]?.pax || 0);
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return "-";

  return Formatter.date(date);
};

/*
|--------------------------------------------------------------------------
| FORMAT ITEM NAME
|--------------------------------------------------------------------------
*/

const formatItemName = (item) => {
  if (!item) return "-";

  if (typeof item === "string") {
    return item;
  }

  return item.name || item.title || item.description || "-";
};

/*
|--------------------------------------------------------------------------
| CAPITALIZE LABEL
|--------------------------------------------------------------------------
*/

const capitalizeLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

/*
|--------------------------------------------------------------------------
| RESOURCE UNIT
|--------------------------------------------------------------------------
*/

const getResourceUnit = (inclusion) => {
  if (inclusion?.model === "Equipment" && inclusion?.item?.unit) {
    return inclusion.item.unit;
  }

  const unit = getResourceRequirement(inclusion);

  return unit === "none" ? "Qty" : unit;
};

/*
|--------------------------------------------------------------------------
| REQUIRES RESOURCE INPUT
|--------------------------------------------------------------------------
*/

const requiresResourceInput = (inclusion) => {
  const unit = getResourceRequirement(inclusion);

  return ["qty", "hrs"].includes(unit);
};

/*
|--------------------------------------------------------------------------
| RESOURCE REQUIREMENT
|--------------------------------------------------------------------------
*/

const getResourceRequirement = (inclusion) =>
  String(
    inclusion?.unit ||
      inclusion?.item?.requirement ||
      (inclusion?.model === "Equipment" ? "qty" : "none"),
  ).toLowerCase();
