import { Building2, Utensils, MapPin } from "lucide-react";

const ServiceDetail = ({ service }) => {
  const isVenue = service.type === "venue";
  const Icon = isVenue ? Building2 : Utensils;

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

            <span className="truncate text-xs font-semibold">
              {service.name}
            </span>
          </div>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{service.time}</span>

            <span>•</span>

            <span>{service.pax} pax</span>

            {service.location && service.location !== "-" && (
              <>
                <span>•</span>

                <span className="flex min-w-0 items-center gap-0.5">
                  <MapPin className="size-3 shrink-0" />

                  <span className="max-w-40 truncate">{service.location}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
