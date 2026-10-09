import { AlertTriangle } from "lucide-react";

const WarningMsg = ({ hasConflicts, isEquipmentSufficient }) => {
  if (!hasConflicts && isEquipmentSufficient) return null;

  return (
    <>
      {(hasConflicts || !isEquipmentSufficient) && (
        <div className="mr-auto flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />

          <span>
            {hasConflicts && !isEquipmentSufficient
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
