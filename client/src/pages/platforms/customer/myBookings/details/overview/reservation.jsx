import { Clock3, MapPin, ReceiptText, UserRound } from "lucide-react";
import { FramedCard, FrameTitle } from "../components";
import { createElement } from "react";

const ReservationOverview = ({ services }) => {
  return (
    <FramedCard header={<FrameTitle icon={ReceiptText} title="Schedule" />}>
      {services.length > 0 ? (
        <div className="divide-y">
          {services.map((service) => {
            const hasLocation =
              service?.location &&
              service.location !== "-" &&
              service.location !== "Location not available";

            const hasAddress =
              service?.address &&
              service.address !== "-" &&
              service.address !== "Address not available";

            return (
              <div
                key={service.type}
                className="grid gap-2.5 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,1fr)_76px] sm:items-start"
              >
                {/* Service */}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium capitalize text-muted-foreground">
                    {service.type}
                  </p>

                  <p className="mt-0.5 truncate text-[13px] font-semibold leading-5">
                    {service.name}
                  </p>
                </div>

                {/* Time + location */}
                <div className="min-w-0 space-y-1.5">
                  <ScheduleMeta icon={Clock3}>{service.time}</ScheduleMeta>
                  {(hasLocation || hasAddress) && (
                    <div className="flex min-w-0 items-start gap-1.5">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                      <div className="min-w-0">
                        {hasLocation && (
                          <p className="text-xs font-medium leading-4">
                            {service.location}
                          </p>
                        )}

                        {hasAddress && (
                          <p className="break-words text-[11px] leading-4 text-muted-foreground">
                            {service.address}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pax */}
                <p className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground sm:justify-end">
                  <UserRound className="size-3.5 shrink-0" />
                  {service.pax} pax
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-3 py-3 text-xs text-muted-foreground">
          No services scheduled.
        </p>
      )}
    </FramedCard>
  );
};

export default ReservationOverview;

const ScheduleMeta = ({ icon: Icon, children }) => {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {createElement(Icon, {
        className: "size-3.5 shrink-0",
      })}

      <span>{children}</span>
    </div>
  );
};
