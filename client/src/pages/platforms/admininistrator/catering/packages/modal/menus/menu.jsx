import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { capitalize } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
const Menu = ({ menu, isSelected = false, toggleMenu = () => {} }) => {
  return (
    <TableRow
      className={`cursor-pointer transition-colors hover:bg-muted/40 ${
        isSelected ? "bg-primary/5" : ""
      }`}
    >
      <TableCell>
        <div className="flex justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleMenu(menu)}
            aria-label={`Select ${menu?.name || "menu"}`}
          />
        </div>
      </TableCell>

      <TableCell
        className="font-medium text-foreground"
        onClick={() => toggleMenu(menu)}
      >
        {capitalize(menu?.name || "")}
      </TableCell>
    </TableRow>
  );
};

export default memo(Menu);
