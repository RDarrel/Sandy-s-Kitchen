import { EmptyPanel } from "../components";
import { memo } from "react";
import Allocation from "./allocation";
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
  return (
    <div>
      <section className="overflow-hidden rounded-md border bg-background">
        <div className="border-b bg-muted/10 px-3 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">
            Equipment Allocations
          </h3>

          <p className="text-[10px] leading-4 text-muted-foreground">
            {!isViewOnly
              ? " Allocate the equipment required for this booking."
              : booking?.status === "pending"
                ? "Equipment will be allocated during booking approval."
                : "Equipment reserved for this booking."}
          </p>
        </div>

        <div className="p-3">
          {items.length > 0 ? (
            <div className="grid gap-1.5 md:grid-cols-2">
              {items.map((inclusion, index) => {
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
      </section>
    </div>
  );
};

export default memo(Inclusions);
