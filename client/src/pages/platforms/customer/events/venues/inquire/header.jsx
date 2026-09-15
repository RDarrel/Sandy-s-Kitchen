import { Users, Clock, Banknote, Home } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { cn } from "@/lib/utils";
import Cloudinary from "@/services/utilities/cloudinary";

const Header = ({ venue, estimate }) => {
  const { images } = venue;
  const defaultImg = images[0];
  return (
    <div className="border-b rounded-t-lg bg-background px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:size-20">
            <img
              src={Cloudinary.getVenueImg(
                defaultImg?.version,
                venue?._id,
                `image-${defaultImg?.id}`,
              )}
              alt={`${venue.name} catering package`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-0.5 pt-3" />
          </div>

          <div className="min-w-0 self-center grid gap-2 ">
            <div>
              <h1 className="truncate text-base font-bold leading-tight tracking-tight sm:text-xl">
                {venue.name}
              </h1>

              <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {venue.description || "Customize this package for your event."}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="catering-package__price">
            <strong>{Formatter.amount(estimate.basePrice)}</strong>
            <span className="text-muted-foreground text-xs">Starting Rate</span>
            <small className="!text-[12px] !font-">
              + {Formatter.amount(estimate?.guests?.rate)} / additional guest
            </small>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-3">
        <HeaderMetric
          icon={Users}
          label="Guests Included"
          value={`${venue.capacity}`}
        />
        <HeaderMetric
          icon={Clock}
          label="Included  Duration"
          value={`${venue.duration?.min}-${venue?.duration?.max} hrs`}
        />

        <HeaderMetric
          icon={Banknote}
          label="Additional Hour Fee"
          value={Formatter.amount(estimate.duration?.rate)}
        />
        <HeaderMetric
          icon={Home}
          label="Venue Setting"
          value={venue?.setting}
        />
      </div>
    </div>
  );
};

export default Header;

const HeaderMetric = ({ icon, value, label, accent = false }) => {
  const IconComponent = icon;

  return (
    <div
      className={cn(
        "grid h-10 shrink-0 content-center gap-1 rounded-md border px-2 text-[10px] sm:px-2.5 sm:text-[11px]",
        accent
          ? "border-primary/20 bg-primary/5 text-primary"
          : "bg-muted/15 text-foreground",
      )}
    >
      <div className="flex items-center gap-1">
        {IconComponent && (
          <IconComponent className="size-3.5 shrink-0 text-primary" />
        )}

        <span
          className={cn(
            "whitespace-nowrap leading-none",
            accent ? "font-medium text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>

      <span className="font-bold text-[15px] leading-none">{value}</span>
    </div>
  );
};
