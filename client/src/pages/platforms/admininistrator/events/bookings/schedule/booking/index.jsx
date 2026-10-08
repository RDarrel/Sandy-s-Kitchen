import { Badge } from "@/components/ui/badge";
import { Formatter, fullName } from "@/services/utilities";
import { UsersRound, MapPin, Clock3, Utensils, Building2 } from "lucide-react";
import { SERVICE_BADGES, STATUS_TEXT } from "../../constant";
import PaymentSummary from "./payment";
import Actions from "./actions";

const Booking = ({ booking, handleAction }) => {
  const service = SERVICE_BADGES[booking.bookingType];
  const isBoth = booking.bookingType === "both";
  const isCateringOnly = booking.bookingType === "catering";

  const getLocation = () => {
    if (isBoth || booking.bookingType === "venue") {
      return booking?.venue?.item?.address;
    }

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
          {service?.label}
        </Badge>
      </div>

      <div className="grid gap-2 px-2.5 py-2 text-xs text-muted-foreground">
        <Time booking={booking} />

        {isBoth && <div className="border-t border-border/60" />}

        <div className="grid gap-1.5">
          <InfoLine
            icon={
              <LocationIcon className="size-3.5 shrink-0 text-muted-foreground" />
            }
            value={getLocation()}
          />

          {isCateringOnly && (
            <InfoLine
              icon={
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              }
              value={booking?.catering?.venue?.address}
            />
          )}
        </div>

        <PaymentSummary booking={booking} />
      </div>

      <Actions handleAction={handleAction} booking={booking} />
    </div>
  );
};

export default Booking;

const InfoLine = ({ icon, value }) => (
  <div className="flex min-w-0 items-center gap-2">
    {icon}

    <span className="min-w-0 truncate font-medium text-foreground">
      {value || "—"}
    </span>
  </div>
);

const Time = ({ booking }) => {
  const { bookingType, catering, venue, status } = booking;
  const isBoth = bookingType === "both";

  if (isBoth) {
    return (
      <div className="grid gap-2">
        <ServiceTimeRow
          icon={<Building2 className={`size-3.5 ${STATUS_TEXT[status]}`} />}
          label="Venue"
          pax={venue?.pax}
          schedule={venue?.schedule}
        />

        <div className="border-t border-border/60" />

        <ServiceTimeRow
          icon={<Utensils className={`size-3.5 ${STATUS_TEXT[status]}`} />}
          label="Catering"
          pax={catering?.pax}
          schedule={catering?.schedule}
        />
      </div>
    );
  }

  const currentService = booking?.[bookingType];

  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Clock3 className={`size-3.5 shrink-0 ${STATUS_TEXT[status]}`} />

        <span className="min-w-0 truncate font-medium text-foreground">
          {Formatter.bookingDateRange(currentService?.schedule)}
        </span>
      </div>

      <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
        <UsersRound className="size-3.5 text-muted-foreground" />
        {currentService?.pax ?? "—"} pax
      </span>
    </div>
  );
};

const ServiceTimeRow = ({ icon, label, pax, schedule }) => (
  <div className="min-w-0">
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0">{icon}</span>

        <span className="font-medium text-foreground">{label}</span>
      </div>

      <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
        <UsersRound className="size-3.5 text-muted-foreground" />
        {pax ?? "—"} pax
      </span>
    </div>

    <div className="mt-0.5 pl-[22px]">
      <span className="block whitespace-normal font-medium leading-4 text-foreground">
        {Formatter.bookingDateRange(schedule)}
      </span>
    </div>
  </div>
);
