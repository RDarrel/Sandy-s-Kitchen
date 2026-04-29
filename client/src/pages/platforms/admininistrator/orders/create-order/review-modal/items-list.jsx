import { Formatter, Inventory } from "@/services/utilities";

const ReviewOrderItemsList = ({ rows = [] }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-2">
      {safeRows.map((item, idx) => {
        const { cost: unitCost, quantity: qty, inventory } = item;
        const unit =
          Inventory.getUnitByMeasurement(inventory?.measurement) || "";

        return (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex gap-[0.8px] px-1 h-8 min-w-[36px] flex-col items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-[10px] leading-none opacity-70">
                  {unit?.toUpperCase()}
                </span>
                <span className="text-sm font-semibold leading-none">
                  {qty}
                </span>
              </div>

              {/* Item info */}
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {inventory?.name || "Item"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Formatter.amount(unitCost)} / {unit}
                </p>
              </div>
            </div>

            {/* Total */}
            <p className="font-semibold text-foreground">
              {Formatter.amount(unitCost * qty)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewOrderItemsList;
