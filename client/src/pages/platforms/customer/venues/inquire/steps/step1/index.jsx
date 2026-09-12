import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/radio-group";

import Section from "./section";
import VenueOption from "./venueOption";
import Field from "./field";

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
  cateringPackages = [],
  form = {},
  updateField = () => {},
  setForm = () => {},
}) => {
  const selectedVenue = form?.venue || {};

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

          <Field label="Date" required>
            <Input
              type="date"
              required
              value={form?.date || ""}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </Field>

          <Field
            label="Guests"
            required
            description={
              selectedVenue?.capacity
                ? `Maximum capacity: ${selectedVenue.capacity} guests`
                : undefined
            }
          >
            <Input
              type="number"
              min={1}
              max={selectedVenue?.capacity}
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
                selectedVenue?.capacity
                  ? `Up to ${selectedVenue.capacity} guests`
                  : "Guests"
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Venue Start Time" required>
              <Input
                type="time"
                required
                value={form?.venue?.time?.start || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    venue: {
                      ...prev?.venue,
                      time: {
                        ...prev?.venue?.time,
                        start: e.target.value,
                      },
                    },
                  }))
                }
              />
            </Field>

            <Field label="Venue End Time" required>
              <Input
                type="time"
                required
                value={form?.venue?.time?.end || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    venue: {
                      ...prev?.venue,
                      time: {
                        ...prev?.venue?.time,
                        end: e.target.value,
                      },
                    },
                  }))
                }
              />
            </Field>
          </div>
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
          value={form?.bookingType || "venue"}
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

      {/* -------------------------------- */}
      {/* Catering Details                 */}
      {/* -------------------------------- */}

      {form?.bookingType === "both" && (
        <>
          <Section
            title="Catering Details"
            description="Provide the guest count and schedule for your catering service."
          >
            <div className="grid gap-3 sm:grid-cols-2">
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
                  placeholder="Number of catering guests"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Catering Start Time" required>
                  <Input
                    type="time"
                    required
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
                  />
                </Field>

                <Field label="Catering End Time" required>
                  <Input
                    type="time"
                    required
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
                  />
                </Field>
              </div>
            </div>
          </Section>
        </>
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
