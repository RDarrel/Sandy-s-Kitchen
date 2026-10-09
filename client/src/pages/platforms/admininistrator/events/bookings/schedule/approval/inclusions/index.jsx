import { EmptyPanel } from "../components";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import Allocation from "./allocation";
import { formatItemName, getResourceUnit } from "../utils";
import { capitalize } from "lodash";

const PENDING_ALLOCATION_STATUSES = ["pending", "changes_requested"];
const EDITABLE_ALLOCATION_STATUSES = ["approved", "confirmed", "setup"];

const Inclusions = ({
  label,
  serviceType = "",
  isViewOnly = false,
  booking,
  items,
  equipAvailability = { venue: 0, catering: 0 },
  isSharedAvailability = false,
  isLoadingEquipAvailability = false,
  handleInclusionAmountChange = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const status = booking?.status;
  const isPendingAllocation = PENDING_ALLOCATION_STATUSES.includes(status);
  //   const canEditAllocations =
  //     isViewOnly && EDITABLE_ALLOCATION_STATUSES.includes(status);
  const canEditAllocations = false;
  const description =
    isViewOnly && isPendingAllocation
      ? "Equipment will be allocated during booking approval."
      : isViewOnly
        ? "Equipment reserved for this booking."
        : " Allocate the equipment required for this booking.";

  useEffect(() => {
    setIsEditing(false);
  }, [booking?._id, isViewOnly, status]);

  const sortedItems = useMemo(() => items || [], [items]);

  return (
    <div>
      <section className="overflow-hidden rounded-md border bg-background">
        <div className="flex items-start justify-between gap-3 border-b bg-muted/10 px-3 py-2.5">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Equipment Allocations
            </h3>

            <p className="text-[10px] leading-4 text-muted-foreground">
              {description}
            </p>
          </div>

          {canEditAllocations && (
            <div className="flex shrink-0 items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="button" size="sm" className="h-7 px-2 text-xs">
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="p-3">
          {sortedItems.length > 0 ? (
            <div className="grid gap-1.5 md:grid-cols-2">
              {sortedItems.map((inclusion, index) => {
                const resourceAvailability =
                  equipAvailability?.[inclusion?.item?._id] || {};

                if (isViewOnly && !isEditing) {
                  return (
                    <ReadOnlyAllocation
                      key={inclusion?.item?._id || `${label}-${index}`}
                      inclusion={inclusion}
                      showSavedAllocation={!isPendingAllocation}
                    />
                  );
                }

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
      </section>
    </div>
  );
};

const ReadOnlyAllocation = ({ inclusion, showSavedAllocation }) => {
  const amount = Number(inclusion?.amount || 0);
  const unit = getResourceUnit(inclusion);
  const hasAllocation = showSavedAllocation && amount > 0;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-background px-2 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold">
          {formatItemName(inclusion?.item)}
        </p>

        <p className="truncate text-[11px] text-muted-foreground">
          {inclusion?.label || "Equipment"}
        </p>
      </div>

      <span
        className={`shrink-0 text-xs font-medium ${
          hasAllocation ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {hasAllocation ? `${amount} ${capitalize(unit)}` : ""}
      </span>
    </div>
  );
};

export default memo(Inclusions);
