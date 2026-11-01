import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";

const pageSize = 5;

const Pagination = ({ page, setPage, error, isLoading }) => {
  const { pagination, bookings } = useSelector(({ bookings }) => bookings);
  const total = error ? 0 : (pagination.total ?? 0);
  const pageCount = Math.max(1, pagination.totalPages ?? 0);
  const currentPage = page;
  const visible = isLoading || error ? [] : bookings;
  const firstPageNumber = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => firstPageNumber + index,
  );
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row">
      <p className="text-[13px] text-muted-foreground">
        {isLoading ? "Loading bookings..." : (
          <>
        Showing{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {visible.length ? (currentPage - 1) * pageSize + 1 : 0}–
          {visible.length ? (currentPage - 1) * pageSize + visible.length : 0}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-foreground tabular-nums">
          {total}
        </span>{" "}
        bookings
          </>
        )}
      </p>
      <nav
        aria-label="Booking pagination"
        className="flex items-center gap-1.5"
      >
        <Button
          variant="outline"
          size="sm"
          className="mr-1 h-8 gap-1 rounded-md border-border bg-card px-2.5 text-xs shadow-none hover:bg-secondary/40 disabled:opacity-40"
          disabled={isLoading || Boolean(error) || currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          Previous
        </Button>
        {pageNumbers.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant="ghost"
            size="icon"
            aria-label={`Go to page ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
            onClick={() => setPage(pageNumber)}
            disabled={isLoading || Boolean(error)}
            className={`size-8 rounded-md text-sm font-medium tabular-nums ${currentPage === pageNumber ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"}`}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="ml-1 h-8 gap-1 rounded-md border-border bg-card px-2.5 text-xs shadow-none hover:bg-secondary/40 disabled:opacity-40"
          disabled={isLoading || Boolean(error) || currentPage >= pageCount}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </Button>
      </nav>
    </div>
  );
};

export default Pagination;
