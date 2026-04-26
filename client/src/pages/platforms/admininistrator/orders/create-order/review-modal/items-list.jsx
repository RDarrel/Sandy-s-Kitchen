import { Formatter } from "@/services/utilities";

const ReviewOrderItemsList = ({ rows = [] }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="space-y-2">
      {safeRows.map(({ item, line }) => {
        const unitCost = Number(line?.unitCost ?? item?.cost) || 0;
        const qty = Number(line?.quantity) || 0;
        const key = String(line?.inventory || item?._id || "");

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {item?.name || "Item"}
              </p>
              <p className="text-xs text-muted-foreground">
                {qty} × {Formatter.amount(unitCost)}
              </p>
            </div>
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

