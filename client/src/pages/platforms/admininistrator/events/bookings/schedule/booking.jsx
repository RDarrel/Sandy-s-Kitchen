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
} from "lucide-react";
import { PAYMENT_STYLES, SERVICE_BADGES, STATUS_TEXT } from "../constant";

const Booking = ({ booking }) => {
  const meta = booking.meta;
  const service = SERVICE_BADGES[booking.bookingType];
  const paymentStatus = "partial";
  const isBoth = booking.bookingType === "both";

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

        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <UsersRound className="size-3.5 shrink-0" />

            <span className="font-medium text-foreground">
              {booking[booking.bookingType]?.pax} pax
            </span>
          </span>

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

          <Badge
            variant="outline"
            className={`capitalize ${PAYMENT_STYLES[paymentStatus]}`}
          >
            {paymentStatus}
          </Badge>
        </div>
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

const Time = ({ booking }) => {
  const { bookingType, catering, venue } = booking;
  const isBoth = bookingType === "both";
  const time = booking[bookingType]?.time || {};
  if (isBoth) {
    return (
      <>
        <div className="flex items-center gap-2 ">
          <Building2
            className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`}
          />
          <span className="w-14 shrink-0 text-muted-foreground">Venue</span>
          <span className="font-medium text-foreground">
            {Formatter.time(venue?.time.start)} -{" "}
            {Formatter.time(venue?.time.end)}
          </span>
          <span className="ml-auto flex  shrink-0 items-center gap-1 font-medium text-foreground">
            <UsersRound className="size-3.5" />
            {booking.venue?.pax} pax
          </span>
        </div>
        <div className="flex items-center gap-2 w-full">
          <Utensils
            className={`size-3.5 shrink-0 ${STATUS_TEXT[booking.status]}`}
          />
          <span className="w-14 shrink-0 text-muted-foreground">Catering</span>

          <span className="font-medium text-foreground">
            {Formatter.time(catering?.time.start)} -{" "}
            {Formatter.time(catering?.time.end)}
          </span>
          <span className="ml-auto  flex shrink-0 items-center gap-1 font-medium text-foreground text-end">
            <UsersRound className="size-3.5" />
            {booking.catering?.pax} pax
          </span>
        </div>
      </>
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
