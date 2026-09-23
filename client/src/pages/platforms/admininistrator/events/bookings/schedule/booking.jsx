import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Formatter, fullName } from "@/services/utilities";
import {
  UsersRound,
  MapPin,
  Clock3,
  Utensils,
  Building2,
  Wallet,
} from "lucide-react";
import { SERVICE_BADGES, STATUS_TEXT } from "../constant";

const PAYMENT_TEXT_STYLES = {
  pending: "text-amber-700",
  paid: "text-emerald-700",
  partial: "text-blue-700",
  unpaid: "text-rose-700",
  refunded: "text-slate-700",
};

const PAYMENT_SUMMARY_STYLES = {
  pending: "border-amber-200 bg-amber-50/70",
  paid: "border-emerald-200 bg-emerald-50/70",
  partial: "border-blue-200 bg-blue-50/70",
  unpaid: "border-rose-200 bg-rose-50/70",
  refunded: "border-slate-200 bg-slate-50/70",
};

const Booking = ({ booking, handleAction }) => {
  const service = SERVICE_BADGES[booking.bookingType];
  const payment = getPaymentInfo(booking);
  const isBoth = booking.bookingType === "both";
  const isCateringOnly = !isBoth && booking?.bookingType === "catering";
  const getLocation = () => {
    if (isBoth || booking.bookingType === "venue")
      return booking?.venue?.item?.address;
    return booking?.catering?.venue?.location;
  };
  const LocationIcon = isCateringOnly ? Building2 : MapPin;
  return (
    <div className="overflow-hidden rounded-md border bg-background shadow-xs">
      <div className="flex items-start justify-between gap-2 px-2.5 pt-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5">
            {booking?.eventType}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {fullName(booking?.customer?.fullName)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={`mt-0.5 shrink-0 text-[10px] ${service?.className}`}
        >
          {service.label}
        </Badge>
      </div>

      <div className="grid gap-1.5 px-2.5 py-2 text-xs text-muted-foreground">
        <Time booking={booking} />

        <div className="grid gap-1.5">
          <InfoLine
            icon={
              <LocationIcon className="size-3.5 shrink-0 text-muted-foreground" />
            }
            value={getLocation()}
          />
          {!isBoth && booking?.bookingType === "catering" && (
            <InfoLine
              icon={
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              }
              value={booking?.catering?.venue?.address}
            />
          )}
        </div>

        <PaymentSummary payment={payment} />
      </div>

      <div className="flex flex-wrap justify-end gap-1.5 border-t bg-muted/10 px-2.5 py-2">
        <Button type="button" variant="outline" size="sm" className="h-7 px-2">
          View
        </Button>

        {booking.status === "pending" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2"
            >
              Reject
            </Button>

            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5"
              onClick={() => handleAction(booking, "approval")}
            >
              Approve
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            Manage
          </Button>
        )}
      </div>
    </div>
  );
};

export default Booking;

const InfoLine = ({ icon, value }) => (
  <span className="flex min-w-0 items-center gap-2">
    {icon}

    <span className="truncate font-medium text-foreground">{value}</span>
  </span>
);

const getPaymentInfo = (booking) => {
  const total = getBookingTotal(booking);
  const received = Number(
    booking?.payment?.amount ??
      booking?.payment?.received ??
      booking?.meta?.received ??
      0,
  );
  const rawStatus = normalizePaymentStatus(booking?.paymentStatus || "pending");
  const normalizedReceived =
    rawStatus === "paid"
      ? total
      : rawStatus === "unpaid" || rawStatus === "pending"
        ? 0
        : received;
  const balance = Math.max(total - normalizedReceived, 0);
  const status =
    rawStatus ||
    (total > 0 && normalizedReceived >= total
      ? "paid"
      : normalizedReceived > 0
        ? "partial"
        : "unpaid");

  return {
    total,
    received: normalizedReceived,
    balance,
    status,
  };
};

const getBookingTotal = (booking) => {
  const total = Number(booking?.pricing?.total);

  if (Number.isFinite(total) && total > 0) return total;

  const cateringTotal = Number(booking?.pricing?.catering?.total || 0);
  const venueTotal = Number(booking?.pricing?.venue?.total || 0);
  const serviceTotal = cateringTotal + venueTotal;

  if (serviceTotal > 0) return serviceTotal;

  return Number(booking?.meta?.amount || 0);
};

const normalizePaymentStatus = (status) =>
  typeof status === "string" ? status.toLowerCase() : "";

const PaymentSummary = ({ payment }) => {
  const isPaid = payment.status === "paid";
  const isPending = payment.status === "pending";
  const hasPayment = payment.received > 0;
  const statusStyle = PAYMENT_TEXT_STYLES[payment.status] || "text-foreground";
  const summaryStyle =
    PAYMENT_SUMMARY_STYLES[payment.status] || "border-border bg-muted/25";
  const label = isPending
    ? "Estimated total"
    : isPaid
      ? "Paid in full"
      : hasPayment
        ? "Partial payment"
        : "No payment yet";
  const amountLabel =
    isPaid || isPending
      ? Formatter.amount(payment.total)
      : `Bal. ${Formatter.amount(payment.balance)}`;

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border px-2 py-1.5 ${summaryStyle}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Wallet className={`size-3.5 shrink-0 ${statusStyle}`} />

        <div className="min-w-0">
          <p className={`truncate font-medium leading-4 ${statusStyle}`}>
            {label}
          </p>

          <p className="truncate text-[11px] leading-4 text-muted-foreground">
            {isPending
              ? "Subject to approval"
              : isPaid
                ? "Payment settled"
                : hasPayment
                  ? `Received ${Formatter.amount(payment.received)}`
                  : `Total ${Formatter.amount(payment.total)}`}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-semibold leading-4 text-foreground">{amountLabel}</p>

        {isPending ? (
          <p className="text-[11px] leading-4 text-muted-foreground">{null}</p>
        ) : !isPaid ? (
          <p className="text-[11px] leading-4 text-muted-foreground">
            to collect
          </p>
        ) : null}
      </div>
    </div>
  );
};

const Time = ({ booking }) => {
  const { bookingType, catering, venue } = booking;
  const isBoth = bookingType === "both";
  const time = booking[bookingType]?.time || {};

  if (isBoth) {
    return (
      <div className="grid gap-1 rounded-md border bg-muted/15 p-1.5">
        <ServiceTimeRow
          icon={
            <Building2
              className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`}
            />
          }
          label="Venue"
          pax={venue?.pax}
          time={venue?.time}
        />

        <ServiceTimeRow
          icon={
            <Utensils
              className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`}
            />
          }
          label="Catering"
          pax={catering?.pax}
          time={catering?.time}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Clock3
          className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`}
        />

        <span className="truncate font-medium text-foreground">
          {Formatter.time(time.start)} - {Formatter.time(time.end)}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
        <UsersRound className="size-3.5 text-muted-foreground" />
        {booking[bookingType]?.pax} pax
      </span>
    </div>
  );
};

const ServiceTimeRow = ({ icon, label, pax, time }) => (
  <div className="grid min-w-0 grid-cols-[auto_4.25rem_minmax(0,1fr)_auto] items-center gap-2">
    {icon}

    <span className="text-muted-foreground">{label}</span>

    <span className="truncate font-medium text-foreground">
      {Formatter.time(time?.start)} - {Formatter.time(time?.end)}
    </span>

    <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
      <UsersRound className="size-3.5" />
      {pax} pax
    </span>
  </div>
);
