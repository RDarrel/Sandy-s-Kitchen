import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Rows from "@/components/shared/pagination/rows";
import { useSelector } from "react-redux";

const Pagination = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  error,
  isLoading,
}) => {
  const { pagination, bookings } = useSelector(({ bookings }) => bookings);
  const total = error ? 0 : (pagination.total ?? 0);
  const pageCount = Math.max(1, error ? 0 : (pagination.totalPages ?? 0));
  const shown =
    error || !bookings.length
      ? 0
      : Math.min((page - 1) * pageSize + bookings.length, total);
  const disabled = isLoading || Boolean(error);

  return (
    <div className="@container w-full min-w-0 border-t border-border/70 px-4 py-3">
      <div className="flex min-w-0 flex-col gap-3 @min-[640px]:flex-row @min-[640px]:items-center @min-[640px]:gap-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 text-xs text-muted-foreground sm:text-sm">
            {isLoading
              ? "Loading booking records..."
              : `${shown} out of ${total} ${total === 1 ? "booking" : "bookings"}`}
          </p>
          <fieldset
            disabled={isLoading}
            className="min-w-0 border-0 p-0 disabled:opacity-50"
          >
            <Rows
              maxPage={pageSize}
              setMaxPage={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </fieldset>
        </div>
        <nav
          aria-label="Booking pagination"
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 @min-[640px]:shrink-0"
        >
          <p
            className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm"
            aria-live="polite"
          >
            Page {page} of {pageCount}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to first page"
              disabled={disabled || page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to previous page"
              disabled={disabled || page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to next page"
              disabled={disabled || page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Go to last page"
              disabled={disabled || page >= pageCount}
              onClick={() => setPage(pageCount)}
            >
              <ChevronsRight />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
