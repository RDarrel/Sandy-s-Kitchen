import { AlertTriangle } from "lucide-react";

const WarningMsg = ({
  hasConflicts,
  isEquipmentSufficient,
  hasIngredientShortage,
}) => {
  if (!hasConflicts && isEquipmentSufficient && !hasIngredientShortage)
    return null;

  return (
    <>
      {(hasConflicts || !isEquipmentSufficient || hasIngredientShortage) && (
        <div className="mr-auto flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />

          <span>
            {hasIngredientShortage
              ? "This booking cannot start setup because some ingredients are out of stock or insufficient."
              : hasConflicts && !isEquipmentSufficient
                ? "This booking cannot be approved due to a venue schedule conflict and insufficient equipment."
                : hasConflicts
                  ? "This booking cannot be approved due to a venue schedule conflict."
                  : "This booking cannot be approved due to insufficient equipment availability."}
          </span>
        </div>
      )}
    </>
  );
};

export default WarningMsg;
