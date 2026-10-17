import { TableCell, TableRow } from "@/components/ui/table";
import { SearchX } from "lucide-react";

const ItemEmpty = ({ search }) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-48 p-6 text-center">
        {search.trim() ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <SearchX className="size-5 text-muted-foreground" />
            </div>

            <div className="flex max-w-xs flex-col items-center gap-1">
              <p className="font-medium text-foreground">
                No matching ingredients
              </p>

              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                Try a different ingredient name or category.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <PackageSearch className="size-6 text-muted-foreground" />
            </div>

            <div className="flex w-full max-w-md flex-col items-center gap-1">
              <p className="font-medium text-foreground">
                No stock planning data
              </p>

              <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
                There are no ingredients to plan for this period. Try selecting
                a different planning period.
              </p>
            </div>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ItemEmpty;
