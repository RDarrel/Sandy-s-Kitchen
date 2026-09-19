import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Formatter, fullName } from "@/services/utilities";
import {
  Phone,
  UsersRound,
  MapPin,
  Clock3,
  Utensils,
  Building2,
  Wallet,
} from "lucide-react";
import { SERVICE_BADGES, STATUS_TEXT } from "../constant";

const PAYMENT_TEXT_STYLES = {
  paid: "text-emerald-700",
  partial: "text-blue-700",
  unpaid: "text-rose-700",
  refunded: "text-slate-700",
};

const paymentStatus = "paid";

const Booking = ({ booking }) => {
  const meta = booking.meta;
  const service = SERVICE_BADGES[booking.bookingType];
  const payment = getPaymentInfo(booking, paymentStatus);
  const isBoth = booking.bookingType === "both";
  const pax = booking[booking.bookingType]?.pax;

  const getLocation = () => {
    if (isBoth || booking.bookingType === "venue")
      return booking?.venue?.item?.address;
    return booking?.catering?.venue?.location;
  };
  return (
    <div className="rounded-md border bg-background p-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-semibold leading-5">
              {booking?.eventType}
            </p>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {fullName(booking?.customer?.fullName)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={`shrink-0 text-[10px] ${service?.className}`}
        >
          {service.label}
        </Badge>
      </div>

      <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
        <Time booking={booking} />

        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />

          <span className="truncate font-medium text-foreground">
            {getLocation()}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3">
          {!isBoth && (
            <span className="flex shrink-0 items-center gap-2">
              <UsersRound className="size-3.5 shrink-0" />

              <span className="font-medium text-foreground">{pax} pax</span>
            </span>
          )}

          <span className="flex min-w-0 items-center gap-2">
            <Phone className="size-3.5 shrink-0" />

            <span className="truncate font-medium text-foreground">
              {booking.contact?.phone}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-muted-foreground">
            {meta?.service}
          </span>
        </div>

        <PaymentSummary payment={payment} />
      </div>

      <div className="mt-2 flex flex-wrap justify-end gap-1.5 border-t pt-2">
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

            <Button type="button" size="sm" className="h-7 px-2.5">
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

const getPaymentInfo = (booking, statusOverride) => {
  const total = Number(booking?.pricing?.total ?? booking?.meta?.amount ?? 0);
  const received = Number(
    booking?.payment?.amount ?? booking?.meta?.received ?? 0,
  );
  const normalizedReceived =
    statusOverride === "paid" ? total : statusOverride === "unpaid" ? 0 : received;
  const balance = Math.max(total - normalizedReceived, 0);
  const rawStatus = booking?.payment?.status || booking?.meta?.payment;
  const status =
    statusOverride ||
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
    label: status === "unpaid" ? "No payment" : status,
  };
};

const PaymentSummary = ({ payment }) => {
  const isPaid = payment.status === "paid";
  const hasPayment = payment.received > 0;
  const statusStyle = PAYMENT_TEXT_STYLES[payment.status] || "text-foreground";

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-muted/25 px-2 py-1.5">
      <span className="flex min-w-0 items-center gap-2">
        <Wallet className="size-3.5 shrink-0 text-muted-foreground" />

        <span className="min-w-0 truncate">
          <span className={`font-medium ${statusStyle}`}>{payment.label}</span>
          <span className="text-muted-foreground">
            {isPaid
              ? " · full"
              : hasPayment
                ? ` · Rec. ${Formatter.amount(payment.received)}`
                : " · none yet"}
          </span>
        </span>
      </span>

      <span className="shrink-0 text-right font-medium text-foreground">
        {isPaid
          ? Formatter.amount(payment.total)
          : `Bal. ${Formatter.amount(payment.balance)}`}
      </span>
    </div>
  );
};

const Time = ({ booking }) => {
  const { bookingType, catering, venue } = booking;
  const isBoth = bookingType === "both";
  const time = booking[bookingType]?.time || {};
  if (isBoth) {
    return (
      <div className="grid gap-1 rounded-md border bg-muted/20 p-1.5">
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
    <div className="flex items-center gap-2">
      <Clock3 className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`} />

      <span className="font-medium text-foreground">
        {Formatter.time(time.start)} - {Formatter.time(time.end)}
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
