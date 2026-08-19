import { Input } from "@/components/ui/input";
import { StepperContent } from "@/components/reui/stepper";
import { Textarea } from "@/components/ui/textarea";

import Field from "../field";
import Header from "../header";
import Actions from "../actions";
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
const Step1 = ({
  packageInfo = {},
  form = {},
  steps = [],
  currentStep,
  updateField = () => {},
  goBack = () => {},
  goNext = () => {},
}) => {
  return (
    <StepperContent value={1} className="p-3 sm:p-5">
      <Header
        title="Event Details"
        description="Give us the schedule, guest count, and place so we can check availability."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event Type" required>
          <select
            value={form.eventType}
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

        <Field label="Number of Guests" required>
          <Input
            type="number"
            min={packageInfo.minimumGuests}
            value={form.guestCount}
            onChange={(e) => updateField("guestCount", e.target.value)}
            placeholder={`${packageInfo.minimumGuests} or more`}
          />
          {/* <FieldHint>
                      Minimum {packageInfo.minimumGuests}; extra guests add{" "}
                      {Formatter.amount(packageInfo.addPricePerGuest)} each.
                    </FieldHint> */}
        </Field>

        <Field label="Preferred Date" required>
          <Input
            type="date"
            value={form.eventDate}
            onChange={(e) => updateField("eventDate", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Time" required>
            <Input
              type="time"
              value={form.eventTime}
              onChange={(e) => updateField("eventTime", e.target.value)}
            />
          </Field>

          <Field label="Hours">
            <Input
              type="number"
              min="1"
              value={form.duration}
              onChange={(e) => updateField("duration", e.target.value)}
              placeholder="4"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Event Location" required>
            <Input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Barangay, city, province"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Setup Notes">
            <Textarea
              value={form.setupNotes}
              onChange={(e) => updateField("setupNotes", e.target.value)}
              className="min-h-16 resize-none"
              placeholder="Buffet, plated, food trays, theme, access notes..."
            />
          </Field>
        </div>
      </div>

      <Actions
        currentStep={currentStep}
        totalSteps={steps.length}
        onBack={goBack}
        onNext={goNext}
      />
    </StepperContent>
  );
};

export default Step1;
