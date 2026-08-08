import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import Venue from "./venue";
import "./style.css";
import { useSelector } from "react-redux";
import VenueSkeleton from "./skeleton";
import Empty from "./empty";

const ITEMS_PER_PAGE = 3;

const Venues = ({ handleAction = () => {} }) => {
  const { filtered: venues, isLoading } = useSelector(({ venues }) => venues);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(venues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleVenues = useMemo(
    () => venues.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, venues],
  );
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };
  const renderPagination = (placement) => (
    <nav
      className={`admin-venue-pagination admin-venue-pagination--${placement}`}
    >
      <Button
        aria-label="Previous venues"
        className="admin-venue-pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        size="icon"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      <div className="admin-venue-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              className="admin-venue-pagination__page"
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
        aria-label="Next venues"
        className="admin-venue-pagination__arrow"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        size="icon"
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </nav>
  );

  if (visibleVenues.length === 0 && !isLoading) return <Empty />;
  return (
    <section className="admin-venue-page">
      <div className="admin-venue-page__inner">
        <div className="admin-venue-reservation">
          <div className="admin-venue-reservation__grid">
            <VenueSkeleton />
            {!isLoading
              ? visibleVenues.map((venue) => {
                  return (
                    <Venue
                      key={venue?._id}
                      venue={venue}
                      handleAction={handleAction}
                    />
                  );
                })
              : Array.from({ length: 4 }).map((_, idx) => (
                  <VenueSkeleton key={idx} />
                ))}
          </div>

          {renderPagination("bottom")}
        </div>
      </div>
    </section>
  );
};

export default Venues;
