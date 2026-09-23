import { capitalize } from "lodash";
import {
  formatItemName,
  getResourceUnit,
  requiresResourceInput,
} from "./utils";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { EmptyPanel } from "./components";
import { memo } from "react";
const Inclusions = ({
  label,
  serviceType = "",
  items,
  handleInclusionAmountChange = () => {},
}) => {
  const sortedItems = [...(items || [])].sort((first, second) => {
    const firstRequiresInput = requiresResourceInput(first);
    const secondRequiresInput = requiresResourceInput(second);

    if (firstRequiresInput === secondRequiresInput) {
      return 0;
    }

    return firstRequiresInput ? -1 : 1;
  });

  return (
    <div>
      {sortedItems.length > 0 ? (
        <div className="grid gap-1.5 md:grid-cols-2">
          {sortedItems.map((inclusion, index) => (
            <Allocation
              key={inclusion?.item?._id || `${label}-${index}`}
              inclusion={inclusion}
              serviceType={serviceType}
              handleInclusionAmountChange={handleInclusionAmountChange}
            />
          ))}
        </div>
      ) : (
        <EmptyPanel label="No resources listed" />
      )}
    </div>
  );
};

export default memo(Inclusions);

const Allocation = memo(
  ({ inclusion, serviceType, handleInclusionAmountChange }) => {
    const needsInput = requiresResourceInput(inclusion);
    const isEquipment = inclusion?.model === "Equipment";
    const amount = Number(inclusion?.amount || 0);

    const available = 12;
    const unit = getResourceUnit(inclusion);

    return (
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-background px-2 py-1.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {formatItemName(inclusion?.item)}
          </p>

          <p className="truncate text-[11px] text-muted-foreground">
            {isEquipment
              ? `${inclusion?.model || "Equipment"} / ${available} available`
              : inclusion?.model || "Item"}
          </p>
        </div>

        {needsInput && (
          <div className="flex items-center justify-end gap-1.5">
            <label className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {capitalize(unit)}
              </span>

              <Input
                type="number"
                min="1"
                value={String(amount || "")}
                required
                onChange={({ target }) =>
                  handleInclusionAmountChange(
                    serviceType,
                    inclusion?.item?._id,
                    Number(target.value),
                  )
                }
                className="h-7 w-16 px-2 text-xs"
              />
            </label>
          </div>
        )}

        {!needsInput && (
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
            <CheckCircle2 className="size-3 text-primary" />
            Included
          </span>
        )}
      </div>
    );
  },
);
