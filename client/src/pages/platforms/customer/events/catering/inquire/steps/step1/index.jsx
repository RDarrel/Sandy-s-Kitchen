import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";
import Section from "./section";
import VenueOption from "./venueOption";
import Field from "./field";
import DatePicker from "@/components/shared/datePicker";
import { addHours, differenceInMinutes } from "date-fns";

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

const Step1 = ({ form = {}, updateField = () => {}, setForm = () => {} }) => {
  const cateringGuests = Number(form.guestCount) || 0;

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

  const getBookingDate = (serviceType, scheduleField) => {
    const date = form?.[serviceType]?.schedule?.[scheduleField];
    return date ? new Date(date) : null;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Event Details</h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Set your event and catering schedule.
        </p>
      </div>

      {/* -------------------------------- */}
      {/* Event & Catering                 */}
      {/* -------------------------------- */}

      <Section title="Event & Catering">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Event Type" required>
            <select
              value={form.eventType || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  eventType: e.target.value,
                }))
              }
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
          <Field label="Guests" required>
            <Input
              type="number"
              value={form.catering?.pax || ""}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  catering: { ...prev?.catering, pax: Number(e.target.value) },
                }))
              }
              placeholder="Enter number of guests"
            />
          </Field>
          <Field label="Start Date & Time" required>
            <DatePicker
              date={getBookingDate("catering", "startAt")}
              setDate={(value) => {
                const cateringStart = new Date(value);
                const cateringEnd = getBookingDate("catering", "endAt");

                handleDateChange("catering", cateringStart, true);

                if (
                  !cateringEnd ||
                  differenceInMinutes(cateringEnd, cateringStart) < 60
                ) {
                  handleDateChange(
                    "catering",
                    addHours(cateringStart, 1),
                    false,
                  );
                }
              }}
              highlightToday={false}
              min={new Date()}
              withTime
              required
              align="center"
            />
          </Field>
          <Field label="End Date & Time" required>
            <DatePicker
              date={getBookingDate("catering", "endAt")}
              setDate={(value) => {
                handleDateChange("catering", value);
              }}
              highlightToday={false}
              disabled={!getBookingDate("catering", "startAt")}
              min={
                getBookingDate("catering", "startAt")
                  ? addHours(getBookingDate("catering", "startAt"), 1)
                  : undefined
              }
              withTime
              required
              align="center"
            />
          </Field>
        </div>
      </Section>

      {/* -------------------------------- */}
      {/* Venue                            */}
      {/* -------------------------------- */}

      <Section title="Venue">
        <Field label="Venue Option" required>
          <RadioGroup
            value={form.bookingType || ""}
            onValueChange={(value) => {
              if (value === "both") {
                setForm((prev) => ({
                  ...prev,
                  venue: {
                    ...prev.venue,
                    pax: prev?.venue?.pax || prev?.catering?.pax,
                    time: {
                      start:
                        prev?.venue?.time?.start || prev?.catering?.time?.start,
                      end: prev?.venue?.time?.end || prev?.catering?.time?.end,
                    },
                  },
                }));
              }
              updateField("bookingType", value);
            }}
            className="grid gap-2 sm:grid-cols-2"
          >
            <VenueOption
              id="existing"
              value="catering"
              selected={form.bookingType === "catering"}
              title="I have a venue"
              description="Provide its name and address."
            />

            <VenueOption
              id="book"
              value="both"
              selected={form.bookingType === "both"}
              title="Book a venue"
              description="Choose from available venues."
            />
          </RadioGroup>
        </Field>
      </Section>

      {/* -------------------------------- */}
      {/* Book Venue                       */}
      {/* -------------------------------- */}

      {form.bookingType === "both" && (
        <Section title="Venue Reservation Details">
          <div className="grid gap-3 grid grid-cols-1 md:grid-cols-3">
            <Field label="Guests" required>
              <Input
                type="number"
                min={cateringGuests || 1}
                value={form?.venue?.pax || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    venue: {
                      ...prev?.venue,
                      pax: Number(e.target.value),
                    },
                  }))
                }
                placeholder={cateringGuests ? `${cateringGuests}+` : "Guests"}
              />
            </Field>
            <Field label="Start Date & Time" required>
              <DatePicker
                date={getBookingDate("venue", "startAt")}
                hideCalendarOnSameDay={false}
                min={new Date()}
                setDate={(value) => {
                  const venueStart = new Date(value);
                  const venueEnd = getBookingDate("venue", "endAt");

                  handleDateChange("venue", venueStart, true);

                  if (
                    !venueEnd ||
                    differenceInMinutes(venueEnd, venueStart) < 60
                  ) {
                    handleDateChange("venue", addHours(venueStart, 1), false);
                  }
                }}
                highlightToday={false}
                withTime
                required
                align="center"
              />
            </Field>
            <Field label="End Date & Time" required>
              <DatePicker
                date={getBookingDate("venue", "endAt")}
                hideCalendarOnSameDay={false}
                setDate={(value) => {
                  handleDateChange("venue", value);
                }}
                highlightToday={false}
                disabled={!getBookingDate("venue", "startAt")}
                min={
                  getBookingDate("venue", "startAt")
                    ? addHours(getBookingDate("venue", "startAt"), 1)
                    : null
                }
                withTime
                required
                align="center"
              />
            </Field>
          </div>
        </Section>
      )}

      {/* -------------------------------- */}
      {/* Existing Venue                   */}
      {/* -------------------------------- */}

      {form.bookingType === "catering" && (
        <Section title="Venue Information">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Venue Name" required>
              <Input
                value={form?.catering?.venue?.location || ""}
                required
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catering: {
                      ...prev.catering,
                      venue: {
                        ...prev?.catering?.venue,
                        location: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="e.g. Covered Court"
              />
            </Field>

            <Field label="Address" required>
              <Input
                required
                value={form?.catering?.venue?.address || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catering: {
                      ...prev.catering,
                      venue: {
                        ...prev?.catering?.venue,
                        address: e.target.value,
                      },
                    },
                  }))
                }
                placeholder="Barangay, City, Province"
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
            value={form.notes || ""}
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
