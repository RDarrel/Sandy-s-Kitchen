import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Debut",
  "Christening / Baptism",
  "Corporate Event",
  "Company Party",
  "Seminar / Training",
  "Conference",
  "Team Building",
  "Anniversary",
  "Family Gathering",
  "Reunion",
  "Graduation Party",
  "School Event",
  "Christmas Party",
  "Prom / Ball",
  "Baby Shower",
  "Gender Reveal",
  "Engagement Party",
  "Other",
];

const Step4 = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {eventTypes.map((event) => (
          <div
            key={event}
            className="
              flex items-center gap-2
              rounded-md border
              px-3 py-2
              hover:bg-muted
            "
          >
            <Checkbox id={event} />

            <Label
              htmlFor={event}
              className="
                cursor-pointer
                text-sm
                font-normal
              "
            >
              {event}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step4;
