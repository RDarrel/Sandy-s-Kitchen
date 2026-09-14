import { Input } from "@/components/ui/input";
import { Beef, Clock, Salad, Users, Banknote } from "lucide-react";

import Header from "../header";
import Cloudinary from "@/services/utilities/cloudinary";
import { Formatter } from "@/services/utilities";

const Step3 = ({ form = {}, setForm = () => {}, packageInfo }) => {
  const venueStart = form?.venue?.time?.start;
  const venueEnd = form?.venue?.time?.end;
  const venuePax = form?.venue?.pax;

  return (
    <div className="w-full min-w-0">
      <Header
        title="Catering Details"
        description="Review your selected package and set your catering schedule."
      />

      {/* Selected Package */}
      <div className="mt-5 border-b pb-4">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          {/* Package Image + Name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="h-14 w-18 shrink-0 overflow-hidden rounded-md border bg-muted sm:h-16 sm:w-20">
              <img
                src={Cloudinary?.getPackageImg(
                  packageInfo?.imgId,
                  packageInfo?._id,
                )}
                alt={packageInfo?.name || "Catering package"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold sm:text-base">
                {packageInfo?.name}
              </h2>

              <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
                Selected catering package
              </p>
            </div>
          </div>

          {/* Package Metrics */}
          <div className="grid grid-cols-2 overflow-hidden rounded-md border sm:grid-cols-5">
            <PackageMetric
              icon={Users}
              label="Included Guests"
              value={packageInfo?.includedGuests ?? "--"}
            />

            <PackageMetric
              icon={Beef}
              label="Main Dishes"
              value={packageInfo?.mainDishes ?? 3}
            />

            <PackageMetric
              icon={Salad}
              label="Side Dishes"
              value={packageInfo?.sideDishes ?? 2}
            />

            <PackageMetric
              icon={Clock}
              label="Service Duration"
              value={packageInfo?.serviceDuration || "4 hours"}
            />

            <PackageMetric
              icon={Banknote}
              label="Package Price"
              value={Formatter.amount(packageInfo?.basePrice)}
            />
          </div>
        </div>
      </div>

      {/* Catering Schedule */}
      <div className="mt-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold">Catering Schedule</h3>

          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            Set the number of guests and service time.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Catering Guests */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">
              Guests <span className="text-destructive">*</span>
            </label>

            <Input
              type="number"
              min={1}
              max={venuePax || undefined}
              value={form?.catering?.pax || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  catering: {
                    ...prev?.catering,
                    pax: Number(e.target.value),
                  },
                }))
              }
              placeholder="Number of guests"
              required
            />

            {/* Venue Guests */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="size-3 shrink-0 text-primary" />

              <span>
                Venue guests:{" "}
                <span className="font-medium text-foreground">
                  {venuePax || "--"}
                </span>
              </span>
            </div>
          </div>

          {/* Start Time */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">
              Start Time <span className="text-destructive">*</span>
            </label>

            <Input
              type="time"
              value={form?.catering?.time?.start || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  catering: {
                    ...prev?.catering,
                    time: {
                      ...prev?.catering?.time,
                      start: e.target.value,
                    },
                  },
                }))
              }
              onBlur={(e) => {
                const value = e.target.value;

                if (!value || form?.catering?.time?.end) return;

                const [hour, minute] = value.split(":");
                const endHour =
                  (Number(hour) + packageInfo?.includedHours) % 24;

                setForm((prev) => ({
                  ...prev,
                  catering: {
                    ...prev.catering,
                    time: {
                      ...prev?.catering?.time,
                      end: `${String(endHour).padStart(2, "0")}:${minute}`,
                    },
                  },
                }));
              }}
              required
            />

            {/* Venue Start */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="size-3 shrink-0 text-primary" />

              <span>
                Venue starts:{" "}
                <span className="font-medium text-foreground">
                  {Formatter.time(venueStart) || "--:--"}
                </span>
              </span>
            </div>
          </div>

          {/* End Time */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">
              End Time <span className="text-destructive">*</span>
            </label>

            <Input
              type="time"
              value={form?.catering?.time?.end || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  catering: {
                    ...prev?.catering,
                    time: {
                      ...prev?.catering?.time,
                      end: e.target.value,
                    },
                  },
                }))
              }
              required
            />

            {/* Venue End */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="size-3 shrink-0 text-primary" />

              <span>
                Venue ends:{" "}
                <span className="font-medium text-foreground">
                  {Formatter.time(venueEnd) || "--:--"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;

const PackageMetric = ({ icon: Icon, label, value }) => {
  return (
    <div
      className="
        min-w-0
        border-b
        p-2.5
        first:border-r
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
        sm:p-3
      "
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="size-3 shrink-0 text-primary sm:size-3.5" />}

        <span className="truncate text-[9px] font-medium text-muted-foreground sm:text-[10px]">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-xs font-semibold leading-none sm:mt-1.5 sm:text-sm">
        {value}
      </p>
    </div>
  );
};
