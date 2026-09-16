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
import { useSelector } from "react-redux";
import Spinner from "@/components/shared/spinner";

const formatTimeRange = (start, end) => {
  if (!start || !end) return "";

  return `${Formatter.time(start)} - ${Formatter.time(end)}`;
};

const joinMenuNames = (menus = []) => {
  if (!menus?.length) return "";

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

const formatUnit = (value, unit) => {
  if (unit === "guest") {
    return value === 1 ? "guest" : "guests";
  }

  if (unit === "hour") {
    return value === 1 ? "hour" : "hours";
  }

  return unit;
};

const Step6 = ({
  estimate,
  form,
  packageInfo,
  selectedMenus,
  selectedVenue,
  handleSubmit = () => {},
}) => {
  const { formSubmitted } = useSelector(({ bookings }) => bookings);
  const cateringTime = form?.catering?.time;
  const venueTime = form?.venue?.time;

  const { catering: Ecatering, venue: Evenue } = estimate || {};

  const isBoth = form?.bookingType === "both";

  const total = (Ecatering?.total || 0) + (Evenue?.total || 0);

  return (
    <div>
      <Header
        title="Review Inquiry"
        description="Check the details before sending your venue inquiry."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-3">
          {/* -------------------------------- */}
          {/* Event                            */}
          {/* -------------------------------- */}

          <ReviewCard
            title="Event"
            icon={CalendarDays}
            items={[
              ["Type", form?.eventType],
              ["Date", Formatter.date(form?.date)],
              ["Address", selectedVenue?.address],
            ]}
          />

          {/* -------------------------------- */}
          {/* Venue                            */}
          {/* Always included                  */}
          {/* -------------------------------- */}

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

          {/* -------------------------------- */}
          {/* Catering                         */}
          {/* Only when Venue + Catering       */}
          {/* -------------------------------- */}

          {isBoth && (
            <>
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

              {/* -------------------------------- */}
              {/* Catering Package                 */}
              {/* -------------------------------- */}

              <ReviewCard
                title="Catering Package"
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

              {/* -------------------------------- */}
              {/* Menu                             */}
              {/* -------------------------------- */}

              <ReviewCard
                title="Menu"
                icon={Utensils}
                items={[
                  ["Main Dishes", joinMenuNames(selectedMenus?.main)],
                  ["Side Dishes", joinMenuNames(selectedMenus?.side)],
                ]}
              />
            </>
          )}

          {/* -------------------------------- */}
          {/* Contact                          */}
          {/* -------------------------------- */}

          <ReviewCard
            title="Contact"
            icon={Phone}
            items={[
              ["Name", form?.contact?.name],
              ["Phone", form?.contact?.phone],
              ["Email", form?.contact?.email],
              [
                "Preferred",
                Formatter.preferredContact(form?.contact?.preferredContact),
              ],
            ]}
          />

          {/* -------------------------------- */}
          {/* Notes                            */}
          {/* -------------------------------- */}

          <ReviewCard
            title="Notes & Special Requests"
            icon={MessageSquare}
            items={[
              ["Notes", form?.notes],
              ["Special Requests", form?.contact?.specialRequests],
            ]}
          />
        </div>

        {/* -------------------------------- */}
        {/* Estimate                         */}
        {/* -------------------------------- */}

        <div className="sticky top-4 h-fit rounded-lg border bg-muted/15 p-3">
          <div className="mb-3 flex items-center gap-2">
            <Package className="size-4 text-primary" />

            <h3 className="text-sm font-semibold">Estimate</h3>
          </div>

          <div className="space-y-4">
            {/* Venue is always included */}
            {Evenue?.basePrice > 0 && (
              <EstimateItem label="Venue" data={Evenue} />
            )}

            {/* Catering only exists when added */}
            {isBoth && Ecatering && (
              <EstimateItem label="Catering Package" data={Ecatering} />
            )}
          </div>

          <div className="mt-4 border-t pt-3">
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
                {Formatter.amount(total)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="mt-4 h-9 w-full gap-1.5 text-xs"
            onClick={handleSubmit}
          >
            Send Inquiry
            {formSubmitted ? (
              <Spinner formSubmitted={formSubmitted} />
            ) : (
              <Send className="size-3.5" />
            )}
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

const ReviewCard = ({ title, icon: Icon, items = [] }) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <Icon className="size-3.5 text-primary" />

        <h3 className="text-xs font-semibold">{title}</h3>
      </div>

      <div className="divide-y">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 px-3 py-2 text-xs sm:grid-cols-[110px_minmax(0,1fr)]"
          >
            <span className="text-muted-foreground">{label}</span>

            <span className="break-words font-medium">{value || "-"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------- */
/* Estimate Item                    */
/* -------------------------------- */

const EstimateItem = ({ label, data }) => {
  if (!data) return null;

  const extraGuests = Math.max(
    0,
    Number(data?.guests?.booked || 0) - Number(data?.guests?.included || 0),
  );

  const extraHours = Number(data?.duration?.extra || 0);

  const hasExtraGuests =
    extraGuests > 0 && Number(data?.guests?.charge || 0) > 0;

  const hasExtraHours =
    extraHours > 0 && Number(data?.duration?.charge || 0) > 0;

  const hasConflict = hasExtraGuests || hasExtraHours;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold">{label}</span>

        <span className="text-xs font-bold text-foreground">
          {Formatter.amount(data?.basePrice)}
        </span>
      </div>

      {hasConflict && (
        <div className="relative ml-2 mt-1.5 border-l border-border pl-3">
          {hasExtraGuests && (
            <>
              <BreakdownGroup
                label="Guests"
                rows={[
                  {
                    label: "Included",
                    value: Number(data?.guests?.included || 0),
                    unit: "guest",
                  },
                  {
                    label: "Booked",
                    value: Number(data?.guests?.booked || 0),
                    unit: "guest",
                  },
                  {
                    label: "Extra",
                    value: extraGuests,
                    unit: "guest",
                  },
                ]}
              />

              <FeeBreakdown
                label="Extra guests"
                quantity={extraGuests}
                rate={data?.guests?.rate}
                unit="guest"
                value={data?.guests?.charge}
              />
            </>
          )}

          {hasExtraHours && (
            <>
              <BreakdownGroup
                label="Duration"
                rows={[
                  {
                    label: "Included",
                    value: Number(data?.duration?.included || 0),
                    unit: "hour",
                  },
                  {
                    label: "Booked",
                    value: Number(data?.duration?.booked || 0),
                    unit: "hour",
                  },
                  {
                    label: "Extra",
                    value: extraHours,
                    unit: "hour",
                  },
                ]}
              />

              <FeeBreakdown
                label="Extra hours"
                quantity={extraHours}
                rate={data?.duration?.rate}
                unit="hour"
                value={data?.duration?.charge}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------- */
/* Breakdown Group                  */
/* -------------------------------- */

const BreakdownGroup = ({ label, rows = [] }) => {
  return (
    <div className="relative py-1">
      <span className="absolute -left-[13px] top-3 h-px w-2 bg-border" />

      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>

      <div className="mt-1 space-y-0.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 text-[11px]"
          >
            <span className="ml-2 text-muted-foreground">{row.label}</span>

            <span className="text-foreground">
              {row.value} {formatUnit(row.value, row.unit)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------- */
/* Fee Breakdown                    */
/* -------------------------------- */

const FeeBreakdown = ({ label, quantity, rate, unit, value }) => {
  return (
    <div className="relative py-1">
      <span className="absolute -left-[13px] top-3 h-px w-2 bg-border" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <p className="ml-2 mt-0.5 text-[11px] text-muted-foreground">
            {quantity} × {Formatter.amount(rate)} / {unit}
          </p>
        </div>

        <span className="shrink-0 text-[11px] font-semibold text-foreground md:text-[12px]">
          {Formatter.amount(value)}
        </span>
      </div>
    </div>
  );
};
