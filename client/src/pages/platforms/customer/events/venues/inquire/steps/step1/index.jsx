import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import Section from "./section";
import VenueOption from "./venueOption";
import Field from "./field";
import VenueDatePicker from "./datePicker";
import DatePicker from "@/components/shared/datePicker";
import { addHours, subHours } from "date-fns";

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Debut",
  "Christening / Baptism",
  "Corporate Event",
  "Family Gathering",
  "Graduation Party",
  "Other",
];

/* ---------------------------------- */
/* Step 1                             */
/* ---------------------------------- */

const Step1 = ({
  form = {},
  selected = {},
  updateField = () => {},
  setForm = () => {},
}) => {
  const handleDateChange = (field, date, isStartDate = false) =>
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        schedule: {
          ...prev[field]?.schedule,
          [isStartDate ? "startAt" : "endAt"]: date ? new Date(date) : date,
        },
      },
    }));

  const isDisabledCateringDate = Boolean(
    !form?.venue?.schedule?.startAt || !form?.venue?.schedule?.endAt,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Event Details</h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Provide the details for your event and venue booking.
        </p>
      </div>

      {/* -------------------------------- */}
      {/* Event Details                    */}
      {/* -------------------------------- */}

      <Section
        title="Event & Venue"
        description="Provide the basic details for your event."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Event Type" required>
            <select
              value={form?.eventType || ""}
              onChange={(e) => updateField("eventType", e.target.value)}
              required
              className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Select event type</option>

              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Guests"
            required
            description={
              selected?.capacity
                ? `Maximum capacity: ${selected.capacity} guests`
                : undefined
            }
          >
            <Input
              type="number"
              min={1}
              max={selected?.capacity}
              value={form?.venue?.pax || ""}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  venue: {
                    ...prev?.venue,
                    pax: Number(e.target.value),
                  },
                }))
              }
              placeholder={
                selected?.capacity
                  ? `Up to ${selected.capacity} guests`
                  : "Guests"
              }
            />
          </Field>

          <Field label="Start Date & Time" required>
            <VenueDatePicker
              date={
                form?.venue?.schedule?.startAt
                  ? new Date(form.venue?.schedule?.startAt)
                  : null
              }
              excludeBookingId={form?._id}
              required
              withTime
              venueId={selected?._id}
              align="center"
              type="start"
              setDate={(value) => {
                handleDateChange("venue", value, true);
                handleDateChange("venue", null);
                if (!form?._id) {
                  handleDateChange("catering", value, true);
                }
              }}
            />
          </Field>
          <Field label="End Date & Time" required>
            <VenueDatePicker
              date={
                form?.venue?.schedule?.endAt
                  ? new Date(form?.venue?.schedule?.endAt)
                  : null
              }
              required
              type="end"
              withTime
              venueId={selected?._id}
              excludeBookingId={form?._id}
              startAt={
                form?.venue?.schedule?.startAt
                  ? new Date(form.venue?.schedule?.startAt)
                  : null
              }
              align="center"
              setDate={(value) => {
                handleDateChange("venue", value);
                if (!form?._id) {
                  handleDateChange("catering", value);
                }
              }}
            />
          </Field>
        </div>
      </Section>

      {/* -------------------------------- */}
      {/* Catering Option                  */}
      {/* -------------------------------- */}

      <Section
        title="Catering"
        description="Would you also like to add catering to your event?"
      >
        <RadioGroup
          value={form?.bookingType}
          onValueChange={(value) => {
            setForm((prev) => ({
              ...prev,
              bookingType: value,
            }));
          }}
          className="grid gap-2 sm:grid-cols-2"
        >
          <VenueOption
            id="venue-only"
            value="venue"
            selected={form?.bookingType === "venue"}
            title="Venue only"
            description="I only need the venue for my event."
          />

          <VenueOption
            id="add-catering"
            value="both"
            selected={form?.bookingType === "both"}
            title="Add Catering"
            description="I would also like catering for my event."
          />
        </RadioGroup>
      </Section>
      {form?.bookingType === "both" && (
        <Section title="Catering Reservation Details">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3 ">
            <Field label="Guests" required>
              <Input
                type="number"
                min={1}
                value={form?.catering?.pax || ""}
                required
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catering: {
                      ...prev?.catering,
                      pax: Number(e.target.value),
                    },
                  }))
                }
                placeholder={"Enter number of guests."}
              />
            </Field>

            <Field label="Start Date & Time" required>
              <DatePicker
                disabled={isDisabledCateringDate}
                date={
                  form?.catering?.schedule?.startAt
                    ? new Date(form.catering?.schedule?.startAt)
                    : null
                }
                min={new Date(form?.venue?.schedule?.startAt)}
                max={
                  form?.venue?.schedule?.endAt
                    ? subHours(new Date(form.venue.schedule?.endAt), 1)
                    : null
                }
                highlightToday={false}
                required
                withTime
                align="center"
                setDate={(value) => {
                  handleDateChange("catering", value, true);
                  handleDateChange("catering", addHours(new Date(value), 1));
                }}
              />
            </Field>
            <Field label="End Date & Time" required>
              <DatePicker
                disabled={isDisabledCateringDate}
                date={
                  form?.catering?.schedule?.endAt
                    ? new Date(form.catering?.schedule?.endAt)
                    : null
                }
                min={
                  form?.venue?.schedule?.startAt
                    ? addHours(new Date(form.venue.schedule?.startAt), 1)
                    : undefined
                }
                max={new Date(form?.venue?.schedule?.endAt)}
                highlightToday={false}
                required
                withTime
                align="center"
                setDate={(value) => handleDateChange("catering", value)}
              />
            </Field>
          </div>
        </Section>
      )}
      {/* -------------------------------- */}
      {/* Notes                            */}
      {/* -------------------------------- */}

      <Section title="Setup Notes">
        <Field label="Notes">
          <Textarea
            value={form?.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            className="min-h-16 resize-none"
            placeholder="Any special setup instructions?"
          />
        </Field>
      </Section>
    </div>
  );
};

export default Step1;
