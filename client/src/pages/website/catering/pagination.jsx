import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  placement = "",
  totalPages,
  currentPage,
  goToPage = () => {},
}) => {
  return (
    <nav className={`catering-pagination catering-pagination--${placement}`}>
      <Button
        aria-label="Previous catering packages"
        className="catering-pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        size="icon"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      <div className="catering-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              className="catering-pagination__page"
              key={page}
              onClick={() => goToPage(page)}
              variant={currentPage === page ? "default" : "outline"}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Next catering packages"
        className="catering-pagination__arrow"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        size="icon"
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </nav>
  );
};

export default Pagination;
