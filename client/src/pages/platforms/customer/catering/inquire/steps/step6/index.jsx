import {
  Package,
  CalendarDays,
  Utensils,
  ChefHat,
  MapPin,
  Phone,
  Send,
  MessageSquare,
} from "lucide-react";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import Header from "../header";

const formatTimeRange = (start, end) => {
  if (!start || !end) return "";

  return `${Formatter.time(start)} - ${Formatter.time(end)}`;
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

  if (unit === "hrs") {
    return `${name} (${amount} hr${amount > 1 ? "s" : ""})`;
  }

  if (unit === "qty") {
    return `${name} (${amount})`;
  }

  return name;
};

const duration = (start, end, isNumber = false) => {
  if (!start || !end) return isNumber ? 0 : "";

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  const durationMinutes = endMinutes - startMinutes;
  const hours = durationMinutes / 60;

  if (isNumber) {
    return hours;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""}`;
};

const Step6 = ({
  estimate,
  form,
  packageInfo,
  selectedMenus,
  selectedVenue,
  handleSubmit = () => {},
}) => {
  const cateringTime = form?.catering?.time;
  const venueTime = form?.venue?.time;

  const { catering: Ecatering, venue: Evenue } = estimate;

  const bookedCateringHours = duration(
    cateringTime?.start,
    cateringTime?.end,
    true,
  );

  return (
    <div>
      <Header
        title="Review Inquiry"
        description="Check the details before sending your catering request."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-3">
          {/* Package */}
          <ReviewCard
            title="Package"
            icon={Package}
            items={[
              ["Package", packageInfo?.name],
              [
                "Inclusions",
                packageInfo?.inclusions
                  ?.map((inclusion) => formatInclusion(inclusion))
                  .join(", "),
              ],
            ]}
          />

          {/* Event */}
          <ReviewCard
            title="Event"
            icon={CalendarDays}
            items={[
              ["Type", form?.eventType],
              ["Date", Formatter.date(form?.date)],
              ["Location", selectedVenue?.address],
            ]}
          />

          {/* Catering */}
          <ReviewCard
            title="Catering"
            icon={ChefHat}
            items={[
              ["Pax", form?.catering?.pax],
              [
                "Service Time",
                formatTimeRange(cateringTime?.start, cateringTime?.end),
              ],
            ]}
          />

          {/* Menu */}
          <ReviewCard
            title="Menu"
            icon={Utensils}
            items={[
              ["Main Dishes", joinMenuNames(selectedMenus?.main)],
              ["Side Dishes", joinMenuNames(selectedMenus?.side)],
            ]}
          />

          {/* Venue */}
          <ReviewCard
            title="Venue"
            icon={MapPin}
            items={[
              ["Venue", selectedVenue?.name],
              ["Pax", form?.venue?.pax],
              [
                "Venue Usage Time",
                formatTimeRange(venueTime?.start, venueTime?.end),
              ],
            ]}
          />

          {/* Contact */}
          <ReviewCard
            title="Contact"
            icon={Phone}
            items={[
              ["Name", form?.contact?.name],
              ["Phone", form?.contact?.phone],
              ["Email", form?.contact?.email],
              ["Preferred", form?.contact?.preferredContact],
            ]}
          />

          {/* Notes & Special Requests */}
          <ReviewCard
            title="Notes & Special Requests"
            icon={MessageSquare}
            items={[
              ["Notes", form?.notes],
              ["Special Requests", form?.contact?.specialRequests],
            ]}
          />
        </div>

        {/* Estimate */}
        <div className="sticky top-5 h-fit rounded-lg border bg-muted/15 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Package className="size-4 text-primary" />

            <h3 className="text-sm font-semibold">Estimate</h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Package */}
            <AmountRow label="Package" value={Ecatering?.base} />

            {/* Extra Guests */}
            {estimate?.extraGuestFee > 0 && (
              <>
                <UsageBreakdown
                  label="Guest Count"
                  included={estimate?.includedGuests}
                  booked={form?.catering?.pax}
                  extra={estimate?.extraGuestCount}
                  unit="guest"
                />

                <AmountRow
                  label="Extra Guests"
                  quantity={estimate?.extraGuestCount}
                  rate={estimate?.extraGuestRate}
                  unit="guest"
                  value={estimate?.extraGuestFee}
                />
              </>
            )}

            {/* Venue */}
            {Evenue?.base > 0 && (
              <AmountRow label="Venue" value={Evenue?.base} />
            )}

            {/* Venue Duration */}
            {/* {Evenue?.includedHours > 0 && ( */}
            <UsageBreakdown
              label="Venue Duration"
              included={Evenue?.includedHours}
              booked={Evenue?.duration}
              extra={Evenue?.extraHours}
              unit="hour"
            />
            {/* )} */}

            {/* Extra Venue Hours */}
            {Evenue?.extraHourFee > 0 && (
              <AmountRow
                label="Extra Venue Hours"
                quantity={Evenue?.extraHours}
                rate={Evenue?.addPricePerHour}
                unit="hour"
                value={Evenue?.extraHourFee}
              />
            )}

            {/* Catering Duration */}
            {estimate?.includedCateringHours > 0 && (
              <UsageBreakdown
                label="Catering Service Duration"
                included={estimate?.includedCateringHours}
                booked={bookedCateringHours}
                extra={estimate?.extraCateringHours}
                unit="hour"
              />
            )}

            {/* Extra Catering Hours */}
            {estimate?.extraCateringHourFee > 0 && (
              <AmountRow
                label="Extra Catering Hours"
                quantity={estimate?.extraCateringHours}
                rate={estimate?.extraCateringHourRate}
                unit="hour"
                value={estimate?.extraCateringHourFee}
              />
            )}
          </div>

          {/* Total */}
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
                {Formatter.amount(estimate?.total)}
              </p>
            </div>
          </div>

          {/* Submit */}
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

/* -------------------------------- */
/* Review Card                      */
/* -------------------------------- */

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

/* -------------------------------- */
/* Usage Breakdown                  */
/* -------------------------------- */

const UsageBreakdown = ({ label, included, booked, extra, unit }) => {
  const formatUnit = (value) => {
    return `${unit}${value !== 1 ? "s" : ""}`;
  };

  return (
    <div className="rounded-md bg-muted/30 px-2.5 py-2">
      <p className="text-[11px] font-medium">{label}</p>

      <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
        <div className="flex justify-between gap-3">
          <span>Included</span>

          <span>
            {included} {formatUnit(included)}
          </span>
        </div>

        <div className="flex justify-between gap-3">
          <span>Booked</span>

          <span>
            {booked} {formatUnit(booked)}
          </span>
        </div>

        {extra > 0 && (
          <div className="flex justify-between gap-3 font-medium text-foreground">
            <span>Extra</span>

            <span>
              {extra} {formatUnit(extra)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------- */
/* Amount Row                       */
/* -------------------------------- */

const AmountRow = ({ label, quantity, rate, unit, value }) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        {quantity > 0 && rate > 0 && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {quantity} × {Formatter.amount(rate)} / {unit}
          </p>
        )}
      </div>

      <span className="shrink-0 text-xs font-semibold">
        {Formatter.amount(value)}
      </span>
    </div>
  );
};
