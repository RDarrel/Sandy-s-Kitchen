import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Field from "../field";
import Header from "../header";
import { fullName } from "@/services/utilities";
const Step5 = ({ updateField, form }) => {
  return (
    <div>
      <Header
        title="Contact Details"
        description="We will use these details to call back and finalize the quote."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Full Name" required>
            <Input
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </Field>
        </div>

        <Field label="Email Address" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="juan@email.com"
          />
        </Field>

        <Field label="Phone Number" required>
          <Input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="09XXXXXXXXX"
          />
        </Field>

        <Field label="Preferred Contact">
          <select
            value={form.preferredContact}
            onChange={(e) => updateField("preferredContact", e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option>Phone call</option>
            <option>SMS</option>
            <option>Email</option>
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Special Requests">
            <Textarea
              value={form.specialRequests}
              onChange={(e) => updateField("specialRequests", e.target.value)}
              className="min-h-16 resize-none"
              placeholder="Allergies, dietary needs, delivery timing, payment questions..."
            />
          </Field>
        </div>
      </div>
    </div>
  );
};

export default Step5;
