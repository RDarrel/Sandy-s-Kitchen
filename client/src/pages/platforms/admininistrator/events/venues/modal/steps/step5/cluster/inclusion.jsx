import { memo } from "react";
import { Field } from "./components";
import { capitalize } from "lodash";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const Inclusion = ({
  item,
  type = "",
  value = 0,
  toggleItem = () => {},
  updateSelectedItem = () => {},
}) => {
  return (
    <div
      key={`${item?._id}-selected`}
      className={`grid gap-2 border-b border-primary/10 bg-card px-3 py-2.5 last:border-b-0 grid-cols-[minmax(0,1fr)_6.7rem_auto] items-center`}
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">
          {capitalize(item?.name || "")}
        </p>
      </div>

      <Field
        value={value}
        item={item}
        type={type}
        onChange={(value) => updateSelectedItem(item?._id, value)}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7 justify-self-end rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${item?.name || title}`}
        onClick={() => toggleItem(item, type)}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
};
export default memo(Inclusion);
