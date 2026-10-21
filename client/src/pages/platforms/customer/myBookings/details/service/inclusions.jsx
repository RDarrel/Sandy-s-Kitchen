import { useMemo } from "react";
import { getInclusionUnit, getItemName, groupInclusions } from "./utils";
import { Check } from "lucide-react";

const InclusionDetails = ({ items = [] }) => {
  const groups = useMemo(() => Object.entries(groupInclusions(items)), [items]);
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>What's Included</SectionLabel>

        {items.length > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            {items.length} item
            {items.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {groups.length > 0 ? (
        <div className="mt-2.5 space-y-2.5">
          {groups.map(([group, values]) => (
            <div key={group}>
              <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                {group}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {values.map((inclusion, index) => (
                  <InclusionRow
                    key={inclusion?.item?._id || `${group}-${index}`}
                    inclusion={inclusion}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          No inclusions listed for this service.
        </p>
      )}
    </div>
  );
};

export default InclusionDetails;

const InclusionRow = ({ inclusion }) => {
  const amount = Number(inclusion?.amount || 0);
  const unit = getInclusionUnit(inclusion);

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-[11px] font-medium">
      <Check className="size-3 shrink-0 text-muted-foreground" />

      <span className="truncate">{getItemName(inclusion)}</span>

      {amount > 0 && (
        <>
          <span className="text-muted-foreground/50">·</span>

          <span className="shrink-0 font-semibold">
            {amount}
            {unit ? ` ${unit}` : ""}
          </span>
        </>
      )}
    </span>
  );
};

const SectionLabel = ({ children }) => {
  return <p className="text-xs font-semibold">{children}</p>;
};
