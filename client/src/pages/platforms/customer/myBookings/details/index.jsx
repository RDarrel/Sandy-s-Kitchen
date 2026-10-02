import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { GET_BOOKING_DETAILS } from "@/services/redux/slices/events/bookings";
import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  UtensilsCrossed,
  Warehouse,
  X,
} from "lucide-react";
import { createElement, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBookingAction,
  getDateParts,
  getPaymentSummary,
  getServices,
  getStatusMeta,
} from "../utils";
import PaymentDetails from "./paymentDetails";

// Icon tint per notice variant — the only place color is used to signal
// status. Everything else (cards, backgrounds) stays neutral.
const NOTICE_ICON_TONE = {
  payment: "text-amber-600 dark:text-amber-400",
  "action-required": "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
  preparing: "text-violet-600 dark:text-violet-400",
  default: "text-muted-foreground",
};

const BookingDetails = () => {
  const { selected: booking, isLoadingBookingDetails } = useSelector(
    ({ bookings }) => bookings,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reference } = useParams();

  useEffect(() => {
    dispatch(GET_BOOKING_DETAILS(reference));
  }, [dispatch, reference]);

  if (isLoadingBookingDetails) {
    return <DetailsSkeleton />;
  }

  if (!booking?._id) {
    return (
      <main className="mx-auto w-full max-w-5xl px-3 py-5 md:px-5">
        <section className="rounded-lg border bg-card px-5 py-14 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <ReceiptText className="size-5 text-muted-foreground" />
          </div>

          <h1 className="mt-4 text-sm font-semibold">Booking not found</h1>

          <p className="mt-1 text-xs text-muted-foreground">
            We couldn't find the booking details for #{reference}.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-5 h-8 gap-1.5"
            onClick={() => navigate("/platforms/my-bookings")}
          >
            <ArrowLeft className="size-3.5" />
            Back to my bookings
          </Button>
        </section>
      </main>
    );
  }

  const status = getStatusMeta(booking);
  const services = getServices(booking);
  const payment = getPaymentSummary(booking);
  const action = getBookingAction(booking, payment);
  const date = getDateParts(booking?.date);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-3 md:px-5 md:py-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2 h-8 gap-1.5 px-2 text-xs text-muted-foreground"
        onClick={() => navigate("/platforms/my-bookings")}
      >
        <ArrowLeft className="size-3.5" />
        My bookings
      </Button>

      {/* Two real columns starting from the very top — the header card
          belongs to the left column only, so the sidebar rises up next
          to it instead of starting lower down. */}
      <div className="space-y-3 lg:hidden">
        <BookingOverview
          booking={booking}
          status={status}
          date={date}
          action={action}
        />

        <PaymentSummary booking={booking} payment={payment} action={action} />

        <ReservationOverview services={services} />

        <PaymentHistory payments={booking?.payments || []} />

        {booking?.catering && <CateringDetails booking={booking} />}

        {booking?.venue && <VenueDetails booking={booking} />}

        <CustomerInformation booking={booking} />

        <TermsSummary terms={booking?.terms} />
      </div>

      <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* On mobile, payment comes first — it's what customers check most. */}
        <aside className="order-1 space-y-3 lg:sticky lg:top-3 lg:order-2">
          <PaymentSummary booking={booking} payment={payment} action={action} />

          <PaymentHistory payments={booking?.payments || []} />

          <TermsSummary terms={booking?.terms} />
        </aside>

        <div className="order-2 min-w-0 space-y-3 lg:order-1">
          <BookingOverview
            booking={booking}
            status={status}
            date={date}
            action={action}
          />

          <ReservationOverview services={services} />

          {booking?.catering && <CateringDetails booking={booking} />}

          {booking?.venue && <VenueDetails booking={booking} />}

          <CustomerInformation booking={booking} />
        </div>
      </div>
    </main>
  );
};

export default BookingDetails;

/* -------------------------------------------------------------------------- */
/* OVERVIEW (date + title + status + action, merged into one compact card)    */
/* -------------------------------------------------------------------------- */

const BookingOverview = ({ booking, status, date, action }) => {
  const navigate = useNavigate();
  const StatusIcon = status.icon;
  const ActionIcon = action.icon;
  const iconTone = NOTICE_ICON_TONE[action.variant] || NOTICE_ICON_TONE.default;

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-md border bg-muted/30">
            <span className="text-[10px] font-semibold uppercase leading-none text-muted-foreground">
              {date.month}
            </span>

            <span className="mt-0.5 text-lg font-bold leading-none">
              {date.day}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <h1 className="truncate text-base font-semibold leading-5 sm:text-lg">
                {booking?.eventType || "Event booking"}
              </h1>

              <span
                className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-2 text-[10px] font-semibold ${status.badgeClassName}`}
              >
                <StatusIcon className="size-3" />
                {status.label}
              </span>
            </div>

            <p className="mt-0.5 font-mono text-[11px] font-semibold text-muted-foreground sm:hidden">
              #{booking?.reference}
            </p>

            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>
                {date.weekday}, {formatDate(booking?.date)}
              </span>

              <span className="hidden size-1 rounded-full bg-border sm:block" />

              <span>Submitted {formatDate(booking?.createdAt)}</span>
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 self-start rounded-md border bg-background px-2.5 py-1.5 sm:inline-flex sm:self-auto">
          <ReceiptText className="size-3.5 shrink-0 text-muted-foreground" />

          <div className="leading-none">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Booking
            </p>

            <p className="mt-1 font-mono text-[11px] font-semibold">
              #{booking?.reference}
            </p>
          </div>
        </div>
      </div>

      {/* Status / action row — neutral background, color used only on the icon. */}
      <div className="flex flex-col gap-2 border-t bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <ActionIcon className={`size-4 shrink-0 ${iconTone}`} />

          <p className="min-w-0 text-xs font-medium leading-5">
            {action.message}
          </p>
        </div>

        {action.buttonLabel && (
          <Button
            type="button"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2.5 text-xs"
            onClick={() =>
              navigate(`/platforms/my-bookings/${booking.reference}/payment`)
            }
          >
            {action.buttonLabel}
            <CreditCard className="size-3.5" />
          </Button>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* RESERVATION DETAILS                                                        */
/* -------------------------------------------------------------------------- */

// Event type and event date already appear in the header card above, and
// "Submitted" is in its subtitle — repeating them here was the clutter.
// This card now shows exactly one new fact (booking type, as a small badge)
// and leads straight into the schedule, which is what customers actually
// come here to check.
const ReservationOverview = ({ services }) => {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex min-h-11 items-center justify-between gap-2.5 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
            <ReceiptText className="size-3.5 text-muted-foreground" />
          </div>

          <h2 className="truncate text-sm font-semibold">Schedule</h2>
        </div>
      </div>

      <div className="p-2.5">
        {services.length > 0 ? (
          <div className="overflow-hidden rounded-md border bg-background">
            {services.map((service) => {
              const hasLocation =
                service?.location &&
                service.location !== "-" &&
                service.location !== "Location not available";

              return (
                <div
                  key={service.type}
                  className="grid gap-1.5 border-b px-2.5 py-2 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)_76px] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium capitalize text-muted-foreground">
                      {service.type}
                    </p>

                    <p className="mt-0.5 truncate text-xs font-semibold">
                      {service.name}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1">
                    <ScheduleMeta icon={Clock3}>{service.time}</ScheduleMeta>

                    {hasLocation && (
                      <ScheduleMeta icon={MapPin} wide>
                        {service.location}
                      </ScheduleMeta>
                    )}
                  </div>

                  <p className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-muted-foreground sm:justify-end">
                    <UserRound className="size-3.5 shrink-0" />
                    {service.pax} pax
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No services scheduled.
          </p>
        )}
      </div>
    </section>
  );
};

const ScheduleMeta = ({ icon: Icon, children, wide = false }) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground ${
        wide ? "max-w-full sm:max-w-[260px]" : ""
      }`}
    >
      {createElement(Icon, {
        className: "size-3.5 shrink-0",
      })}

      <span className={wide ? "truncate" : ""}>{children}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* CATERING                                                                   */
/* -------------------------------------------------------------------------- */

const CateringDetails = ({ booking }) => {
  const catering = booking?.catering;
  const item = catering?.item || {};
  const inclusions = catering?.inclusions || item?.inclusions || [];

  return (
    <Section
      title={item?.name || "Catering package"}
      icon={UtensilsCrossed}
      badge="Catering"
    >
      <div className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
        <MenuList title="Main dishes" items={catering?.mainDishes || []} />
        <MenuList title="Side dishes" items={catering?.sideDishes || []} />
      </div>

      <div className="mt-3 border-t pt-3">
        <InclusionDetails items={inclusions} />
      </div>
    </Section>
  );
};

/* -------------------------------------------------------------------------- */
/* VENUE                                                                      */
/* -------------------------------------------------------------------------- */

const VenueDetails = ({ booking }) => {
  const venue = booking?.venue;
  const item = venue?.item || {};
  const inclusions = venue?.inclusions || item?.inclusions || [];

  return (
    <Section title={item?.name || "Venue"} icon={Warehouse} badge="Venue">
      <InclusionDetails items={inclusions} />
    </Section>
  );
};

/* -------------------------------------------------------------------------- */
/* MENU                                                                       */
/* -------------------------------------------------------------------------- */

const MenuList = ({ title, items = [] }) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border bg-background">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-2.5 py-1.5">
        <p className="text-xs font-semibold">{title}</p>

        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="px-2">
          {items.map((item, index) => (
            <div
              key={item?._id || item?.name || index}
              className="flex min-w-0 items-start gap-2 border-b py-1.5 last:border-b-0"
            >
              <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

              <div className="min-w-0">
                <p className="text-xs font-medium">
                  {item?.name || "Menu item"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-2.5 py-2 text-xs text-muted-foreground">
          No items selected.
        </p>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* INCLUSIONS                                                                 */
/* -------------------------------------------------------------------------- */

const InclusionDetails = ({ items = [] }) => {
  const groups = useMemo(() => Object.entries(groupInclusions(items)), [items]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>What's Included</SectionLabel>

        {items.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="mt-2.5 space-y-2.5">
          {groups.map(([group, values]) => (
            <div key={group}>
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                {group}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {values.map((inclusion, index) => (
                  <InclusionRow
                    key={inclusion?.item?._id || `${group}-${index}`}
                    inclusion={inclusion}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          No inclusions listed for this service.
        </p>
      )}
    </div>
  );
};

const InclusionRow = ({ inclusion }) => {
  const amount = Number(inclusion?.amount || 0);
  const unit = getInclusionUnit(inclusion);

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] font-medium">
      <Check className="size-3 shrink-0 text-muted-foreground" />

      <span className="truncate">{getItemName(inclusion)}</span>

      {amount > 0 && (
        <>
          <span className="text-muted-foreground/50">·</span>

          <span className="shrink-0 font-semibold">
            {amount}
            {unit ? ` ${unit}` : ""}
          </span>
        </>
      )}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* CUSTOMER INFORMATION                                                       */
/* -------------------------------------------------------------------------- */

const CustomerInformation = ({ booking }) => {
  const contact = booking?.contact || {};

  return (
    <Section title="Contact information" icon={UserRound}>
      <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        <ContactItem
          icon={UserRound}
          label="Contact person"
          value={contact?.name}
        />
        <ContactItem icon={Phone} label="Phone" value={contact?.phone} />
        <ContactItem icon={Mail} label="Email" value={contact?.email} />
        <ContactItem
          icon={ReceiptText}
          label="Preferred contact"
          value={Formatter.preferredContact(contact?.preferredContact)}
        />
      </div>

      {(contact?.specialRequests || booking?.notes) && (
        <div className="mt-3 border-t pt-3">
          <SectionLabel>Special requests / notes</SectionLabel>

          <p className="mt-1.5 whitespace-pre-line text-xs leading-5 text-muted-foreground">
            {contact?.specialRequests || booking?.notes}
          </p>
        </div>
      )}
    </Section>
  );
};

const ContactItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-start gap-2">
      {createElement(Icon, {
        className: "mt-0.5 size-3.5 shrink-0 text-muted-foreground",
      })}

      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-xs font-medium">{value || "-"}</p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PAYMENT SUMMARY                                                            */
/* -------------------------------------------------------------------------- */

const PaymentSummary = ({ booking, payment, action }) => {
  const navigate = useNavigate();
  const isFullyPaid = payment.total > 0 && payment.balance === 0;
  const hasPendingPayment = Number(payment.pendingAmount || 0) > 0;
  const displayedBalance = hasPendingPayment
    ? Math.max(
        Number(payment.balance || 0) - Number(payment.pendingAmount || 0),
        0,
      )
    : Number(payment.balance || 0);

  const serviceRows = getPaymentBreakdownRows(booking?.pricing);

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <h2 className="text-sm font-semibold">Payment summary</h2>
        <CreditCard className="size-3.5 text-muted-foreground" />
      </div>

      <div className="p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">
              {isFullyPaid
                ? "Status"
                : hasPendingPayment
                  ? "Balance after verification"
                  : "Remaining balance"}
            </p>

            {isFullyPaid ? (
              <p className="mt-1 flex items-center gap-1.5 text-base font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Fully paid
              </p>
            ) : (
              <p className="mt-1 text-xl font-semibold leading-none tracking-tight">
                {Formatter.amount(displayedBalance)}
              </p>
            )}
          </div>

          <p className="shrink-0 text-right text-[11px] text-muted-foreground">
            of {Formatter.amount(payment.total)} total
          </p>
        </div>

        <div className="my-3 border-t" />

        <div className="space-y-3">
          {serviceRows.map((service) => (
            <PaymentServiceBreakdown key={service.label} service={service} />
          ))}

          <div className="border-t pt-2">
            <AmountRow label="Total amount" value={payment.total} strong />
          </div>

          {payment.verifiedAmount > 0 && (
            <AmountRow
              label="Verified payments"
              value={payment.verifiedAmount}
              positive
            />
          )}

          {payment.pendingAmount > 0 && (
            <>
              <AmountRow
                label="Pending verification"
                value={payment.pendingAmount}
                pending
              />
              <p className="pt-1 text-[10px] leading-4 text-muted-foreground">
                Your balance will be updated after this payment is verified.
              </p>
            </>
          )}
        </div>

        {action.buttonLabel && (
          <Button
            type="button"
            className="mt-3 h-8 w-full gap-1.5 text-xs"
            onClick={() =>
              navigate(`/platforms/my-bookings/${booking.reference}/payment`)
            }
          >
            {action.buttonLabel}
            <CreditCard className="size-3.5" />
          </Button>
        )}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* PAYMENT HISTORY                                                            */
/* -------------------------------------------------------------------------- */

const PaymentHistory = ({ payments = [] }) => {
  const paymentItems = payments.length > 0 ? payments : [];
  const [selectedPayment, setSelectedPayment] = useState(null);

  const sortedPayments = useMemo(() => {
    return [...paymentItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [paymentItems]);
  return (
    <>
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Payment history</h2>

            {paymentItems?.length > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                {paymentItems.length}
              </span>
            )}
          </div>

          <ReceiptText className="size-3.5 text-muted-foreground" />
        </div>

        {paymentItems.length > 0 ? (
          <div className="px-3 py-3">
            <PaymentHistoryTimeline
              payments={sortedPayments}
              onViewPayment={setSelectedPayment}
            />
          </div>
        ) : (
          <div className="px-4 py-5 text-center">
            <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-muted">
              <ReceiptText className="size-3.5 text-muted-foreground" />
            </div>

            <p className="mt-2 text-xs font-medium">No payments yet</p>

            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Submitted payments will appear here.
            </p>
          </div>
        )}
      </section>
      <PaymentDetails
        isOpen={Boolean(selectedPayment)}
        payment={selectedPayment}
        setIsOpen={() => setSelectedPayment(null)}
      />
      {/* <PaymentHistoryModal
        payment={selectedPayment}
        setPayment={setSelectedPayment}
      /> */}
    </>
  );
};

const PaymentHistoryTimeline = ({ payments = [], onViewPayment }) => {
  return (
    <Timeline defaultValue={payments.length} className="gap-0">
      {payments.map((payment, index) => (
        <TimelineItem
          key={payment?._id || index}
          step={index + 1}
          className="group-data-[orientation=vertical]/timeline:ms-7 group-data-[orientation=vertical]/timeline:not-last:pb-4"
        >
          <TimelineHeader>
            <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem)] group-data-[orientation=vertical]/timeline:w-px group-data-[orientation=vertical]/timeline:translate-y-5" />

            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <TimelineTitle className="truncate text-[13px] font-semibold">
                    {Formatter.amount(payment?.amount)}
                  </TimelineTitle>

                  <PaymentStatus status={payment?.status} />
                </div>

                <TimelineContent className="mt-0.5 text-xs">
                  <span className="truncate">
                    {getPaymentMethodName(payment)}
                  </span>
                  <span className="px-1 text-muted-foreground/60">
                    &middot;
                  </span>
                  <span>
                    {capitalizeText(
                      payment?.type === "deposit"
                        ? "Down Payment"
                        : payment?.type,
                    )}
                  </span>
                </TimelineContent>
              </div>

              {onViewPayment && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-6 shrink-0 rounded-md"
                        onClick={() => onViewPayment(payment)}
                      >
                        <ArrowUpRight className="size-3.5" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent side="left">
                      View payment details
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <PaymentTimelineIndicator status={payment?.status} />
          </TimelineHeader>

          <TimelineDate className="mb-0 mt-1 text-[11px]">
            {formatDateTime(payment?.paidAt || payment?.createdAt)}
          </TimelineDate>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

// Status shown as a small dot + text — no colored pill background.
const PAYMENT_STATUS_DOT = {
  verified: "bg-emerald-600",
  pending: "bg-amber-600",
  voided: "bg-red-600",
  refunded: "bg-slate-400",
};

const PAYMENT_TIMELINE_STATUS = {
  verified: {
    icon: Check,
    className: "border-none bg-emerald-600 text-white",
  },
  pending: {
    icon: Clock3,
    className: "border-none bg-amber-500 text-white",
  },
  voided: {
    icon: X,
    className: "border-none bg-red-600 text-white",
  },
  refunded: {
    icon: CreditCard,
    className: "border-none bg-slate-400 text-white",
  },
};

const PaymentTimelineIndicator = ({ status }) => {
  const meta =
    PAYMENT_TIMELINE_STATUS[status] || PAYMENT_TIMELINE_STATUS.refunded;
  const Icon = meta.icon;

  return (
    <TimelineIndicator
      className={`flex size-5 items-center justify-center group-data-[orientation=vertical]/timeline:-left-5 ${meta.className}`}
    >
      <Icon className="size-3" />
    </TimelineIndicator>
  );
};

const PaymentStatus = ({ status }) => {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
      <span
        className={`size-1.5 rounded-full ${
          PAYMENT_STATUS_DOT[status] || PAYMENT_STATUS_DOT.refunded
        }`}
      />
      {capitalizeText(status === "voided" ? "rejected" : status)}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* BOOKING TERMS                                                              */
/* -------------------------------------------------------------------------- */

const TermsSummary = ({ terms }) => {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <h2 className="text-sm font-semibold">Booking terms</h2>
        <Clock3 className="size-3.5 text-muted-foreground" />
      </div>

      {terms ? (
        <div className="space-y-2 p-3">
          <Term
            label="Required down payment"
            value={Formatter.amount(terms.requiredDeposit)}
          />
          <Term
            label="Down payment due"
            value={formatDateTime(terms.depositDeadline)}
          />
          <Term
            label="Full payment due"
            value={formatDate(terms.balanceDueAt)}
          />
          <Term
            label="Cancellation deadline"
            value={formatDate(terms.cancellationDeadline)}
          />
        </div>
      ) : (
        <div className="p-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Booking terms will be available after your booking has been
            approved.
          </p>
        </div>
      )}
    </section>
  );
};

const Term = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[58%] text-right font-medium">{value || "-"}</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* GENERIC COMPONENTS                                                         */
/* -------------------------------------------------------------------------- */

const Section = ({ title, description, icon: Icon, badge, children }) => {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex min-h-11 items-center gap-2.5 border-b px-3 py-2.5">
        {Icon && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="size-3.5 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{title}</h2>

          {description && (
            <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {badge && (
          <span className="shrink-0 rounded-md border bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            {badge}
          </span>
        )}
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
};

const SectionLabel = ({ children }) => {
  return <p className="text-xs font-semibold">{children}</p>;
};

const PaymentServiceBreakdown = ({ service }) => {
  return (
    <div>
      <AmountRow label={service.label} value={service.total} strong />

      <div className="ml-2 mt-1.5 space-y-1.5 border-l pl-3">
        {service.guestCharge > 0 && (
          <PaymentChargeRow
            label="Extra guests"
            detail={`${service.guests.extra} pax`}
            value={service.guestCharge}
          />
        )}

        {service.durationCharge > 0 && (
          <PaymentChargeRow
            label="Extra hours"
            detail={formatHours(service.duration.extra)}
            value={service.durationCharge}
          />
        )}
      </div>
    </div>
  );
};

const PaymentChargeRow = ({ label, detail, value }) => {
  return (
    <div className="relative flex items-start justify-between gap-3 text-xs">
      <span className="absolute -left-3 top-2 h-px w-2.5 bg-border" />

      <span className="text-muted-foreground">
        <span>{label}</span>
        <span className="ml-1 text-[11px]">{detail}</span>
      </span>
      <span>{Formatter.amount(value || 0)}</span>
    </div>
  );
};

const AmountRow = ({
  label,
  value,
  detail,
  strong = false,
  positive = false,
  pending = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span
        className={
          strong ? "font-semibold text-foreground" : "text-muted-foreground"
        }
      >
        {detail ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-muted-foreground/40" />
            {label}
            <span className="text-[11px] font-normal text-muted-foreground/80">
              {detail}
            </span>
          </span>
        ) : (
          label
        )}
      </span>

      <span
        className={[
          strong ? "font-semibold" : "font-medium",
          positive ? "text-emerald-700 dark:text-emerald-400" : "",
          pending ? "text-amber-700 dark:text-amber-400" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Formatter.amount(value || 0)}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SKELETON                                                                   */
/* -------------------------------------------------------------------------- */

const SkeletonBlock = ({ className }) => {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
};

const SkeletonCard = ({ children, className = "" }) => {
  return (
    <section
      className={`overflow-hidden rounded-lg border bg-card ${className}`}
    >
      {children}
    </section>
  );
};

const SkeletonSectionHeader = ({ withBadge = false }) => {
  return (
    <div className="flex min-h-11 items-center gap-2.5 border-b px-3 py-2.5">
      <SkeletonBlock className="size-7 shrink-0 rounded-md" />
      <SkeletonBlock className="h-4 w-36" />
      {withBadge && <SkeletonBlock className="ml-auto h-6 w-16 rounded-md" />}
    </div>
  );
};

const PaymentSummarySkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="size-3.5" />
      </div>

      <div className="p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="mt-2 h-6 w-24" />
          </div>
          <SkeletonBlock className="h-3 w-20" />
        </div>

        <div className="my-3 border-t" />

        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item}>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3.5 w-28" />
                <SkeletonBlock className="h-3.5 w-16" />
              </div>
              <div className="ml-2 mt-1.5 space-y-1.5 pl-3">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-14" />
                </div>
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-3.5 w-16" />
            </div>
          </div>

          <SkeletonBlock className="h-3 w-full" />
        </div>

        <SkeletonBlock className="mt-3 h-8 w-full rounded-md" />
      </div>
    </SkeletonCard>
  );
};

const PaymentHistorySkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-6 rounded-full" />
        </div>

        <SkeletonBlock className="size-3.5 rounded-sm" />
      </div>

      <div className="px-3 py-3">
        <div className="space-y-0">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative ms-7 pb-4 last:pb-0">
              {item !== 3 && (
                <span className="absolute -left-5 top-5 h-[calc(100%-0.25rem)] w-px bg-border" />
              )}

              <SkeletonBlock className="absolute -left-[1.875rem] top-0 size-5 rounded-full" />

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <SkeletonBlock className="h-3.5 w-20" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>

                  <div className="mt-1.5 flex items-center gap-1">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="size-1 rounded-full" />
                    <SkeletonBlock className="h-3 w-14" />
                  </div>
                </div>

                <SkeletonBlock className="size-6 shrink-0 rounded-md" />
              </div>

              <SkeletonBlock className="mt-1 h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
};

const TermsSkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="size-3.5" />
      </div>
      <div className="space-y-2 p-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

const BookingOverviewSkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonBlock className="h-12 w-14 rounded-md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="h-5 w-16 rounded-md" />
            </div>
            <SkeletonBlock className="mt-2 h-3 w-52" />
          </div>
        </div>
        <SkeletonBlock className="h-9 w-28 rounded-md" />
      </div>

      <div className="flex flex-col gap-2 border-t bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SkeletonBlock className="size-4 shrink-0" />
          <SkeletonBlock className="h-4 w-full max-w-md" />
        </div>
        <SkeletonBlock className="h-7 w-20 rounded-md" />
      </div>
    </SkeletonCard>
  );
};

const ScheduleSkeleton = () => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader />
      <div className="p-2.5">
        <div className="overflow-hidden rounded-md border bg-background">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="grid gap-1.5 border-b px-2.5 py-2 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)_76px] sm:items-center"
            >
              <div>
                <SkeletonBlock className="h-3 w-14" />
                <SkeletonBlock className="mt-1.5 h-3.5 w-36" />
              </div>
              <div className="flex gap-2">
                <SkeletonBlock className="h-3.5 w-20" />
                <SkeletonBlock className="h-3.5 w-32" />
              </div>
              <SkeletonBlock className="h-3.5 w-14 sm:ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
};

const ServiceDetailsSkeleton = ({ withMenus = false }) => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader withBadge />
      <div className="p-3">
        {withMenus ? (
          <div className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
            {[1, 2].map((column) => (
              <div
                key={column}
                className="min-w-0 overflow-hidden rounded-md border bg-background"
              >
                <div className="flex items-center justify-between border-b bg-muted/30 px-2.5 py-1.5">
                  <SkeletonBlock className="h-3.5 w-20" />
                  <SkeletonBlock className="h-3 w-10" />
                </div>
                <div className="px-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 border-b py-1.5 last:border-b-0"
                    >
                      <SkeletonBlock className="size-3.5 shrink-0 rounded-full" />
                      <SkeletonBlock className="h-3.5 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className={withMenus ? "mt-3 border-t pt-3" : ""}>
          <div className="flex items-center justify-between gap-2">
            <SkeletonBlock className="h-3.5 w-24" />
            <SkeletonBlock className="h-3 w-10" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonBlock key={item} className="h-6 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonCard>
  );
};

const ContactSkeleton = () => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader />
      <div className="grid gap-x-6 gap-y-2.5 p-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-start gap-2">
            <SkeletonBlock className="mt-0.5 size-3.5 shrink-0" />
            <div>
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-1.5 h-3.5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

const DetailsSkeleton = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-3 md:px-5 md:py-4">
      <SkeletonBlock className="mb-2 h-8 w-24 rounded-md" />

      <div className="space-y-3 lg:hidden">
        <BookingOverviewSkeleton />
        <PaymentSummarySkeleton />
        <ScheduleSkeleton />
        <PaymentHistorySkeleton />
        <ServiceDetailsSkeleton withMenus />
        <ServiceDetailsSkeleton />
        <ContactSkeleton />
        <TermsSkeleton />
      </div>

      <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 space-y-3 lg:order-1">
          <BookingOverviewSkeleton />
          <ScheduleSkeleton />
          <ServiceDetailsSkeleton withMenus />
          <ServiceDetailsSkeleton />
          <ContactSkeleton />
        </div>

        <div className="order-1 space-y-3 lg:order-2">
          <PaymentSummarySkeleton />
          <PaymentHistorySkeleton />
          <TermsSkeleton />
        </div>
      </div>
    </main>
  );
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getItemName = (inclusion) => {
  if (typeof inclusion?.item === "string") {
    return isObjectId(inclusion.item) ? "Resource" : inclusion.item;
  }

  return inclusion?.item?.name || inclusion?.item?.title || "Resource";
};

const getInclusionUnit = (inclusion) => {
  const unit = inclusion?.unit;

  if (!unit || unit === "qty") {
    return "";
  }

  return unit;
};

const getPaymentMethodName = (payment) => {
  if (typeof payment?.method === "object") {
    return payment?.method?.name || "Payment method";
  }

  return capitalizeText(payment?.method || "Payment method");
};

const getPaymentMethodId = (payment) => {
  if (typeof payment?.method === "object") {
    return payment?.method?._id || "";
  }

  return payment?.method || "";
};

const getPaymentBreakdownRows = (pricing = {}) => {
  return [
    getServicePricingBreakdown("Catering Package", pricing?.catering),
    getServicePricingBreakdown("Venue", pricing?.venue),
  ].filter(Boolean);
};

const getServicePricingBreakdown = (label, pricing = {}) => {
  const total = Number(pricing?.total || 0);

  if (total <= 0) {
    return null;
  }

  const guests = getPricingMetric(pricing?.guests);
  const duration = getPricingMetric(pricing?.duration);
  const guestCharge =
    guests.extra > 0 ? Number(pricing?.guests?.charge || 0) : 0;
  const durationCharge =
    duration.extra > 0 ? Number(pricing?.duration?.charge || 0) : 0;
  const baseAmount = Number(pricing?.basePrice || 0);

  return {
    label,
    total:
      baseAmount > 0
        ? baseAmount
        : Math.max(total - guestCharge - durationCharge, 0),
    guests,
    duration,
    guestCharge,
    durationCharge,
  };
};

const getPricingMetric = (breakdown = {}) => {
  const included = Number(breakdown?.included || 0);
  const booked = Number(breakdown?.booked || 0);
  const extra = Number(breakdown?.extra || 0);
  const computedExtra = Math.max(booked - included, 0);

  return {
    extra: extra > 0 ? extra : computedExtra,
  };
};

const formatHours = (hours) => {
  return `${hours} hr${hours === 1 ? "" : "s"}`;
};

const groupInclusions = (items = []) => {
  return items.reduce((groups, inclusion) => {
    const model =
      inclusion?.model === "Equipment"
        ? "Equipment"
        : inclusion?.model === "Services"
          ? "Services"
          : "Other inclusions";

    if (!groups[model]) {
      groups[model] = [];
    }

    groups[model].push(inclusion);

    return groups;
  }, {});
};

const isObjectId = (value = "") => {
  return /^[a-f\d]{24}$/i.test(String(value));
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const capitalizeText = (value = "") => {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};
