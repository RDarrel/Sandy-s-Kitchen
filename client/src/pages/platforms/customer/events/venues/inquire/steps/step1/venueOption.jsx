import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

const VenueOption = ({ id, value, selected, title, description, onChange }) => {
  return (
    <Label
      htmlFor={id}
      className={`relative flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/40"
      }`}
    >
      <RadioGroupItem id={id} value={value} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{title}</p>

        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {description}
        </p>
      </div>

      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </Label>
  );
};

export default VenueOption;
