import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import Package from "./package";
import "./style.css";

const ITEMS_PER_PAGE = 3;

const Body = ({ handleAction = () => {} }) => {
  const { collections: packages } = useSelector(
    ({ cateringPackages }) => cateringPackages,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, packages],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const renderPagination = (placement) => (
    <nav className={`admin-pagination admin-pagination--${placement}`}>
      <Button
        aria-label="Previous admin packages"
        className="admin-pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        size="icon"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      <div className="admin-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              className="admin-pagination__page"
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
        aria-label="Next admin packages"
        className="admin-pagination__arrow"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        size="icon"
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </nav>
  );

  return (
    <section className="admin-page">
      <div className="admin-page__inner">
        <div className="admin-packages">
          {visiblePackages.map((item) => {
            return (
              <Package item={item} key={item._id} handleAction={handleAction} />
            );
          })}
        </div>

        {renderPagination("bottom")}
      </div>
    </section>
  );
};

export default Body;
