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
  packageInfo = {},
  form = {},
  updateField = () => {},
  setForm = () => {},
}) => {
  const cateringGuests = Number(form.guestCount) || 0;

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
              min={packageInfo.includedGuests}
              value={form.catering?.pax || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  catering: { ...prev?.catering, pax: Number(e.target.value) },
                }))
              }
              placeholder={`${packageInfo.includedGuests}+`}
            />
          </Field>

          <Field label="Date" required>
            <Input
              type="date"
              value={form?.date || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Catering Start" required>
              <Input
                type="time"
                value={form?.catering?.time?.start || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catering: {
                      ...prev.catering,
                      time: {
                        ...prev?.catering?.time,
                        start: e.target.value,
                      },
                    },
                  }))
                }
              />
            </Field>

            <Field label="Catering End" required>
              <Input
                type="time"
                value={form?.catering?.time?.end || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    catering: {
                      ...prev.catering,
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

      {/* -------------------------------- */}
      {/* Venue                            */}
      {/* -------------------------------- */}

      <Section title="Venue">
        <Field label="Venue Option" required>
          <RadioGroup
            value={form.venueOption || ""}
            onValueChange={(value) => updateField("venueOption", value)}
            className="grid gap-2 sm:grid-cols-2"
          >
            <VenueOption
              id="existing"
              value="existing"
              selected={form.venueOption === "existing"}
              title="I have a venue"
              description="Provide its name and address."
            />

            <VenueOption
              id="book"
              value="book"
              selected={form.venueOption === "book"}
              title="Book a venue"
              description="Choose from available venues."
            />
          </RadioGroup>
        </Field>
      </Section>

      {/* -------------------------------- */}
      {/* Book Venue                       */}
      {/* -------------------------------- */}

      {form.venueOption === "book" && (
        <Section title="Venue Details">
          <div className="mb-3 rounded-md bg-muted/40 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              These details will be used for your venue reservation.
            </p>
          </div>

          <div className="grid gap-3 grid grid-cols-1 md:grid-cols-2">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time" required>
                <Input
                  type="time"
                  value={form.venue?.time?.start || ""}
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

              <Field label="End Time" required>
                <Input
                  type="time"
                  value={form.venue?.time?.end || ""}
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
      )}

      {/* -------------------------------- */}
      {/* Existing Venue                   */}
      {/* -------------------------------- */}

      {form.venueOption === "existing" && (
        <Section title="Venue Information">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Venue Name" required>
              <Input
                value={form?.catering?.venue?.location || ""}
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
