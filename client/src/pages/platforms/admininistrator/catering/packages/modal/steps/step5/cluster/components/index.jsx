import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { capitalize } from "lodash";
import { Search } from "lucide-react";

export const Empty = ({ className, title }) => {
  return (
    <div
      className={`flex min-h-19 flex-col items-center justify-center gap-2 px-3 py-4 text-center ${className}`}
    >
      <Search className="size-5 text-muted-foreground" />
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
    </div>
  );
};

export const Field = ({ item, type, value = "", onChange = () => {} }) => {
  const { requirement = "" } = item || {};
  const isVisible = !(requirement === "none" && type === "Services");
  const label = requirement || "qty";

  return (
    <label className={`min-w-0  opacity-${isVisible ? "1" : "0"}`}>
      <span className="sr-only">{label}</span>
      <InputGroup>
        <InputGroupInput
          aria-label={label}
          required={isVisible}
          className="h-7 rounded-md px-2 text-xs text-center"
          min={0}
          placeholder={`e.g. ${label === "Qty" ? "20" : "4"}`}
          type={"number"}
          value={String(value || "")}
          onChange={({ target }) => onChange(target.value)}
        />
        <InputGroupAddon align="inline-end" className={"text-xs"}>
          {capitalize(label)}
        </InputGroupAddon>
      </InputGroup>
    </label>
  );
};
