import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

const ListingSkeleton = () => (
  <>
    {Array.from({ length: 2 }, (_, groupIndex) => (
      <Fragment key={groupIndex}>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="border-y border-l border-border py-3">
            {groupIndex === 0 && (
              <span role="status" className="sr-only">Loading sales...</span>
            )}
            <Skeleton className="h-5 w-40" aria-hidden="true" />
          </TableCell>
          <TableCell colSpan={2} className="border-y border-r border-border py-3">
            <Skeleton className="ml-auto h-5 w-20" aria-hidden="true" />
          </TableCell>
        </TableRow>
        <TableRow className="bg-background hover:bg-background">
          {["Menu", "Qty", "Total Sales", "Total Cost", "Gross Profit"].map((label, index) => (
            <TableHead
              key={label}
              scope="col"
              className={`border border-border text-left font-semibold text-foreground ${index === 0 ? "min-w-[180px]" : "whitespace-nowrap"}`}
            >
              {label}
            </TableHead>
          ))}
        </TableRow>
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <TableRow key={rowIndex} aria-hidden="true">
            {["w-32", "w-8", "w-20", "w-20", "w-20"].map((width, columnIndex) => (
              <TableCell key={columnIndex} className="border border-border">
                <Skeleton className={`h-5 ${width}`} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </Fragment>
    ))}
  </>
);

export default ListingSkeleton;
