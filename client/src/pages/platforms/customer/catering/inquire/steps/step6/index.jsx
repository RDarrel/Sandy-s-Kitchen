import { Package, CalendarDays, Utensils, Phone, Send } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import Header from "../header";
const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const joinMenuNames = (menus = []) => {
  if (menus.length === 0) return "";
  return menus.map(({ name }) => name).join(", ");
};
const getInclusionName = (inclusion = {}) => {
  return inclusion?.item?.name || inclusion?.name || "Included item";
};
const formatInclusion = (inclusion = {}) => {
  const name = getInclusionName(inclusion);
  const amount = Number(inclusion?.amount) || 0;
  const unit = inclusion?.unit;

  if (!amount || !unit) return name;
  if (unit === "hrs") return `${name} (${amount} hr${amount > 1 ? "s" : ""})`;
  if (unit === "qty") return `${name} (${amount})`;

  return name;
};

const Step6 = ({
  estimate,
  form,
  packageInfo,
  selectedMenus,
  selectedVenue,
  handleSubmit = () => {},
}) => {
  return (
    <div>
      <Header
        title="Review Inquiry"
        description="Check the details before sending your catering request."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-3">
          <ReviewCard
            title="Package"
            icon={Package}
            items={[
              ["Package", packageInfo.name],
              [
                "Inclusions",
                packageInfo.inclusions
                  .map((inclusion) => formatInclusion(inclusion))
                  .join(", "),
              ],
            ]}
          />

          <ReviewCard
            title="Event"
            icon={CalendarDays}
            items={[
              ["Type", form.eventType],
              ["Guests", form.guestCount],
              ["Date", formatDate(form.eventDate)],
              ["Time", formatTime(form.eventTime)],
              ["Location", form.location],
            ]}
          />

          <ReviewCard
            title="Menu"
            icon={Utensils}
            items={[
              ["Main Courses", joinMenuNames(selectedMenus.main)],
              ["Side Menus", joinMenuNames(selectedMenus.side)],
              ["Venue", selectedVenue?.name],
            ]}
          />

          <ReviewCard
            title="Contact"
            icon={Phone}
            items={[
              ["Name", form.fullName],
              ["Phone", form.phone],
              ["Email", form.email],
              ["Preferred", form.preferredContact],
            ]}
          />
        </div>

        <div className="h-fit rounded-lg border bg-muted/15 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Package className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Estimate</h3>
          </div>

          <div className="space-y-2 text-xs">
            <AmountRow label="Package" value={estimate.base} />
            <AmountRow label="Extra guests" value={estimate.extraGuestFee} />
            <AmountRow label="Venue" value={estimate.venueFee} />
          </div>

          <div className="mt-3 border-t pt-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Estimated Total
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Subject to final confirmation.
                </p>
              </div>
              <p className="text-xl font-bold text-primary">
                {Formatter.amount(estimate.total)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="mt-4 h-9 w-full gap-1.5 text-xs"
            onClick={handleSubmit}
          >
            Send Inquiry
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step6;

const ReviewCard = ({ title, icon, items }) => {
  const IconComponent = icon;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <IconComponent className="size-3.5 text-primary" />
        <h3 className="text-xs font-semibold">{title}</h3>
      </div>

      <div className="divide-y">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 px-3 py-2 text-xs sm:grid-cols-[110px_minmax(0,1fr)]"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value || "Not provided"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AmountRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{Formatter.amount(value)}</span>
    </div>
  );
};
