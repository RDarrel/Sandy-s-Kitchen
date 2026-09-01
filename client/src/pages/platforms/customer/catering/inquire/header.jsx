import { Gift, Salad, Utensils, Users, Clock, Banknote } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { cn } from "@/lib/utils";
import Cloudinary from "@/services/utilities/cloudinary";

const Header = ({ packageInfo, estimate }) => {
  return (
    <div className="border-b rounded-t-lg bg-background px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:size-20">
            <img
              src={Cloudinary.getPackageImg(packageInfo.imgId, packageInfo._id)}
              alt={`${packageInfo.name} catering package`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-0.5 pt-3" />
          </div>

          <div className="min-w-0 self-center grid gap-2 ">
            <div>
              <h1 className="truncate text-base font-bold leading-tight tracking-tight sm:text-xl">
                {packageInfo.name}
              </h1>

              <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {packageInfo.description ||
                  "Customize this package for your event."}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="catering-package__price">
            <strong>{Formatter.amount(estimate.base)}</strong>
            <span className="text-muted-foreground text-xs">Starting Rate</span>
            <small className="!text-[12px] !font-">
              + {Formatter.amount(estimate?.addPricePerGuest)} / additional
              guest
            </small>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-1 mt-3">
        <HeaderMetric
          icon={Users}
          label="Guests Included"
          value={`${packageInfo.includedGuests}`}
        />
        <HeaderMetric
          icon={Utensils}
          label="Main Courses"
          value={packageInfo.mainCourseLimit}
        />
        <HeaderMetric
          icon={Salad}
          label="Side Menus"
          value={packageInfo.sideMenuLimit}
        />
        <HeaderMetric
          icon={Clock}
          label="Service Duration"
          value={`${packageInfo.includedHours} hrs`}
        />

        <HeaderMetric
          icon={Banknote}
          label="Additional Hour Fee"
          value={Formatter.amount(packageInfo.addPricePerHour)}
        />
        <HeaderMetric
          icon={Gift}
          label="Inclusions"
          value={packageInfo.inclusions.length}
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
