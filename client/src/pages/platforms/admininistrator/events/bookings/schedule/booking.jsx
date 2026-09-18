import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Formatter } from "@/services/utilities";
import { Phone, UsersRound, MapPin, Clock3 } from "lucide-react";
import {
  PAYMENT_STYLES,
  SERVICE_BADGES,
  STATUS_LABELS,
  STATUS_TEXT,
} from "../constant";

const Booking = ({ booking }) => {
  const meta = booking.meta;
  const service = SERVICE_BADGES[meta.service];
  console.log("booking start", booking?.start);
  return (
    <div className="rounded-md border bg-background p-2.5 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-semibold leading-5">
              {booking.title}
            </p>

            <Badge variant="secondary" className="shrink-0 capitalize">
              {STATUS_LABELS[meta.status]}
            </Badge>
          </div>

          <p className="truncate text-xs text-muted-foreground">
            {meta.customer}
          </p>
        </div>

        {service && (
          <Badge
            variant="outline"
            className={`shrink-0 text-[10px] ${service.className}`}
          >
            {service.label}
          </Badge>
        )}
      </div>

      <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock3 className={`size-3.5 shrink-0 ${STATUS_TEXT[meta.status]}`} />

          <span className="font-medium text-foreground">
            {Formatter.time(booking.start)} - {Formatter.time(booking.end)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />

          <span className="truncate font-medium text-foreground">
            {meta.venue}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <UsersRound className="size-3.5 shrink-0" />

            <span className="font-medium text-foreground">
              {meta.guests} pax
            </span>
          </span>

          <span className="flex min-w-0 items-center gap-2">
            <Phone className="size-3.5 shrink-0" />

            <span className="truncate font-medium text-foreground">
              {meta.contact}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-muted-foreground">{meta.service}</span>

          <Badge
            variant="outline"
            className={`capitalize ${PAYMENT_STYLES[meta.payment]}`}
          >
            {meta.payment}
          </Badge>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap justify-end gap-1.5 border-t pt-2">
        <Button type="button" variant="outline" size="sm" className="h-7 px-2">
          View
        </Button>

        {meta.status === "pending" ? (
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
