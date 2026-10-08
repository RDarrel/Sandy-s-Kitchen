import { useEffect, useRef, useState } from "react";
import { Building2, Utensils, MapPin } from "lucide-react";

const ServiceDetail = ({ service }) => {
  const isVenue = service.type === "venue";
  const Icon = isVenue ? Building2 : Utensils;

  const rowRef = useRef(null);
  const locationRef = useRef(null);

  const [showLocation, setShowLocation] = useState(false);

  const hasLocation = Boolean(service.location && service.location !== "-");

  useEffect(() => {
    const row = rowRef.current;
    const location = locationRef.current;

    if (!row || !location || !hasLocation) return;

    const checkLocation = () => {
      const rowWidth = row.clientWidth;

      const rowStyle = window.getComputedStyle(row);
      const gap = parseFloat(rowStyle.columnGap) || 0;

      const time = row.querySelector("[data-time]");
      const separator = row.querySelector("[data-separator]");
      const pax = row.querySelector("[data-pax]");

      if (!time || !separator || !pax) return;

      const requiredWidth =
        time.getBoundingClientRect().width +
        separator.getBoundingClientRect().width +
        pax.getBoundingClientRect().width +
        location.scrollWidth +
        gap * 3;

      setShowLocation(requiredWidth <= rowWidth);
    };

    const observer = new ResizeObserver(checkLocation);

    observer.observe(row);
    checkLocation();

    return () => observer.disconnect();
  }, [service.time, service.pax, service.location, hasLocation]);

  return (
    <div className="min-w-0 rounded-md border bg-muted/10 px-2 py-1.5">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded bg-background">
          <Icon className="size-3.5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {isVenue ? "Venue" : "Catering"}
            </span>

            <span className="min-w-0 truncate text-[13px] font-semibold">
              {service.name}
            </span>
          </div>

          <div
            ref={rowRef}
            className="mt-0.5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground"
          >
            <span
              data-time
              className="min-w-0 truncate font-medium text-foreground"
            >
              {service.time}
            </span>

            <span data-separator className="shrink-0">
              •
            </span>

            <span data-pax className="shrink-0">
              {service.pax} pax
            </span>

            {hasLocation && (
              <span
                ref={locationRef}
                className={
                  showLocation
                    ? "inline-flex shrink-0 items-center gap-0.5"
                    : "pointer-events-none absolute invisible inline-flex items-center gap-0.5"
                }
                aria-hidden={!showLocation}
              >
                <MapPin className="size-3 shrink-0" />

                <span className="whitespace-nowrap">{service.location}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
