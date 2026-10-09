import { capitalize } from "lodash";
import {
  formatItemName,
  getResourceUnit,
  requiresResourceInput,
} from "./utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmptyPanel } from "./components";
import { memo } from "react";

const Inclusions = ({
  label,
  serviceType = "",
  items,
  equipAvailability = { venue: 0, catering: 0 },
  isSharedAvailability = false,
  isLoadingEquipAvailability = false,
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
          {sortedItems.map((inclusion, index) => {
            const resourceAvailability =
              equipAvailability?.[inclusion?.item?._id] || {};
            return (
              <Allocation
                key={inclusion?.item?._id || `${label}-${index}`}
                inclusion={inclusion}
                available={resourceAvailability?.[inclusion?.source] || 0}
                resourceAvailability={resourceAvailability}
                serviceType={serviceType}
                isSharedAvailability={isSharedAvailability}
                isLoadingEquipAvailability={isLoadingEquipAvailability}
                handleInclusionAmountChange={handleInclusionAmountChange}
              />
            );
          })}
        </div>
      ) : (
        <EmptyPanel label="No resources listed" />
      )}
    </div>
  );
};

export default memo(Inclusions);

const Allocation = memo(
  ({
    inclusion,
    serviceType,
    handleInclusionAmountChange,
    available,
    resourceAvailability = {},
    isSharedAvailability = false,
    isLoadingEquipAvailability = false,
  }) => {
    const { source } = inclusion;
    const needsInput = requiresResourceInput(inclusion);
    const isEquipment = inclusion?.model === "Equipment";
    const amount = Number(resourceAvailability[`${source}Allocation`] || 0);

    const hasAvailabilityRecord =
      "available" in resourceAvailability ||
      serviceType in resourceAvailability;
    const totalAvailable = Number(
      resourceAvailability?.available ?? available ?? 0,
    );

    const otherServiceType = serviceType === "venue" ? "catering" : "venue";
    const otherAllocation = isSharedAvailability
      ? Number(resourceAvailability?.[`${otherServiceType}Allocation`] || 0)
      : 0;

    const maxAllowed = Math.max(totalAvailable - otherAllocation, 0);
    const shouldShowAvailabilitySkeleton =
      isEquipment && isLoadingEquipAvailability;
    const hasNoAvailability =
      isEquipment &&
      !shouldShowAvailabilitySkeleton &&
      hasAvailabilityRecord &&
      maxAllowed <= 0;
    const exceedsAvailability =
      isEquipment &&
      !shouldShowAvailabilitySkeleton &&
      hasAvailabilityRecord &&
      amount > 0 &&
      amount > maxAllowed;
    const hasAvailabilityWarning = hasNoAvailability || exceedsAvailability;
    const maxInputValue =
      isEquipment && hasAvailabilityRecord ? maxAllowed : undefined;
    const availabilityMessage = hasNoAvailability
      ? "None available"
      : `Only ${maxAllowed} available`;

    const unit = getResourceUnit(inclusion);

    return (
      <div
        className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-1.5 ${
          hasAvailabilityWarning
            ? "border-destructive/40 bg-destructive/5"
            : "bg-background"
        }`}
      >
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {formatItemName(inclusion?.item)}
          </p>

          {shouldShowAvailabilitySkeleton ? (
            <Skeleton className="mt-1 h-3.5 w-28" />
          ) : (
            <p
              className={`flex min-w-0 items-center gap-1 truncate text-[11px] ${
                hasAvailabilityWarning
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {hasAvailabilityWarning && (
                <AlertTriangle className="size-3 shrink-0" />
              )}

              <span className="truncate">
                {isEquipment ? (
                  hasAvailabilityWarning ? (
                    availabilityMessage
                  ) : (
                    <>
                      {inclusion?.label || "Equipment"} •{" "}
                      <span className="font-medium">{available}</span> available
                    </>
                  )
                ) : (
                  inclusion?.model || "Item"
                )}
              </span>
            </p>
          )}
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
                max={maxInputValue}
                value={String(amount || "")}
                required
                onChange={({ target }) =>
                  handleInclusionAmountChange(
                    inclusion?.source,
                    inclusion?.item?._id,
                    Number(target.value),
                  )
                }
                aria-invalid={hasAvailabilityWarning}
                className={`h-7 w-16 px-2 text-xs ${
                  hasAvailabilityWarning
                    ? "border-destructive focus-visible:ring-destructive/30"
                    : ""
                }`}
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
