import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

const ListingSkeleton = ({ children }) => (
  <>
    {Array.from({ length: 2 }, (_, groupIndex) => (
      <Fragment key={groupIndex}>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="border border-border py-3">
            {groupIndex === 0 && (
              <span role="status" className="sr-only">
                Loading booking transactions...
              </span>
            )}
            <div className="flex items-center justify-between gap-4" aria-hidden="true">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
          </TableCell>
        </TableRow>
        {children}
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <TableRow key={rowIndex} aria-hidden="true">
            <TableCell className="border border-border py-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-4 w-36" />
            </TableCell>
            <TableCell className="border border-border py-3">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="border border-border py-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-4 w-32" />
            </TableCell>
            <TableCell className="border border-border">
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell className="border border-border">
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="border border-border">
              <Skeleton className="ml-auto size-8" />
            </TableCell>
          </TableRow>
        ))}
      </Fragment>
    ))}
  </>
);

export default ListingSkeleton;
