import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import Field from "../field";
import Header from "../header";

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

const Step1 = ({ packageInfo = {}, form = {}, updateField = () => {} }) => {
  return (
    <div>
      <Header
        title="Event Details"
        description="Give us the schedule, guest count, and place so we can check availability."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Event Type */}
        <Field label="Event Type" required>
          <select
            value={form.eventType || ""}
            onChange={(e) => updateField("eventType", e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="">Select event type</option>

            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        {/* Number of Guests */}
        <Field label="Number of Guests" required>
          <Input
            type="number"
            min={packageInfo.includedGuests}
            value={form.guestCount || ""}
            onChange={(e) => updateField("guestCount", e.target.value)}
            placeholder={`${packageInfo.includedGuests} or more`}
          />
        </Field>

        {/* Preferred Date */}
        <Field label="Preferred Date" required>
          <Input
            type="date"
            value={form.eventDate || ""}
            onChange={(e) => updateField("eventDate", e.target.value)}
          />
        </Field>

        {/* Time & Hours */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time" required>
            <Input
              type="time"
              value={form.eventTime || ""}
              onChange={(e) => updateField("eventTime", e.target.value)}
            />
          </Field>

          <Field label="Hours">
            <Input
              type="number"
              min="1"
              value={form.duration || ""}
              onChange={(e) => updateField("duration", e.target.value)}
              placeholder="4"
            />
          </Field>
        </div>

        {/* Venue Option */}
        <div className="sm:col-span-2">
          <Field label="Venue" required>
            <RadioGroup
              value={form.venueOption || ""}
              onValueChange={(value) => updateField("venueOption", value)}
              className="grid gap-2 sm:grid-cols-2"
            >
              {/* Existing Venue */}
              <Label
                htmlFor="existing"
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                  form.venueOption === "existing"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="existing" id="existing" />

                <div>
                  <p className="text-sm font-medium">I already have a venue</p>

                  <p className="text-xs text-muted-foreground">
                    Provide the venue details.
                  </p>
                </div>
              </Label>

              {/* Book Venue */}
              <Label
                htmlFor="book"
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                  form.venueOption === "book"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value="book" id="book" />

                <div>
                  <p className="text-sm font-medium">Book a venue</p>

                  <p className="text-xs text-muted-foreground">
                    Choose from available venues.
                  </p>
                </div>
              </Label>
            </RadioGroup>
          </Field>
        </div>

        {/* Existing Venue Details */}
        {form.venueOption === "existing" && (
          <>
            <Field label="Venue Name" required>
              <Input
                value={form.venueName || ""}
                onChange={(e) => updateField("venueName", e.target.value)}
                placeholder="e.g. Gym, Covered Court, or Residence"
              />
            </Field>

            <Field label="Complete Address" required>
              <Input
                value={form.venueAddress || ""}
                onChange={(e) => updateField("venueAddress", e.target.value)}
                placeholder="Barangay, city, province"
              />
            </Field>
          </>
        )}

        {/* Setup Notes */}
        <div className="sm:col-span-2">
          <Field label="Setup Notes">
            <Textarea
              value={form.setupNotes || ""}
              onChange={(e) => updateField("setupNotes", e.target.value)}
              className="min-h-16 resize-none"
              placeholder="e.g. Please leave space for a small stage or place the buffet table near the entrance."
            />
          </Field>
        </div>
      </div>
    </div>
  );
};

export default Step1;
