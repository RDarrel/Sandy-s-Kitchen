import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { Set_SELECTED } from "@/services/redux/slices/resources/services";
import { capitalize } from "lodash";
import { Building, Pencil, Trash2, Utensils, Venus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const Equipment = ({ item, onRequestDelete = () => {} }) => {
  const dispatch = useDispatch();
  return (
    <TableRow className="bg-card">
      <TableCell className="whitespace-normal">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            {capitalize(item.name)}
          </p>
        </div>
      </TableCell>

      <TableCell>{capitalize(item.description || "--")}</TableCell>
      <TableCell>
        {
          <div className="flex flex-wrap gap-2">
            {item.availableFor.includes("catering") && (
              <Badge variant="outlined">
                <Utensils className="mr-1" /> Catering
              </Badge>
            )}

            {item.availableFor.includes("venue") && (
              <Badge variant="outlined">
                <Building className="mr-1" /> Venue
              </Badge>
            )}
          </div>
        }
      </TableCell>

      <TableCell>
        <div className="flex justify-end gap-2">
          <ActionButton
            title="Edit"
            icon={Pencil}
            onClick={() => dispatch(Set_SELECTED(item))}
          />
          <ActionButton
            title="Delete"
            icon={Trash2}
            destructive
            onClick={() => onRequestDelete(item)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default memo(Equipment);

const ActionButton = ({ title, icon: Icon, destructive = false, onClick }) => (
  <Button
    type="button"
    size="icon"
    variant="outline"
    onClick={onClick}
    className={
      destructive
        ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        : "hover:bg-accent/15 hover:text-accent-foreground"
    }
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{title}</span>
  </Button>
);

const QuantityDisplay = ({ quantity = 0, unit = "" }) => {
  return (
    <p className="font-medium tabular-nums text-foreground">
      {quantity}
      <span className="text-xs text-muted-foreground ml-1">{unit}</span>
    </p>
  );
};
