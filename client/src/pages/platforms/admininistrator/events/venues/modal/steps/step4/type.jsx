import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Type = ({ checked = false, event, handleSelected }) => {
  console.log("event", event);
  return (
    <Label
      htmlFor={`event-${event}`}
      className="
                    flex min-h-10 cursor-pointer items-center
                    gap-2 rounded-lg border bg-card
                    px-2.5 py-2
                    text-xs font-normal
                    transition-colors
                    hover:border-primary/40
                    hover:bg-muted/50
                  "
    >
      <Checkbox
        id={`event-${event}`}
        checked={checked}
        onCheckedChange={(checked) => handleSelected(checked, event)}
        className="size-3.5 shrink-0"
      />

      <span className="leading-tight">{event}</span>
    </Label>
  );
};

export default memo(Type);
