import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/venues";
import Item from "./item";
import VenueSkeleton from "./item/skeleton";

const ITEMS_PER_PAGE = 4;

const Venue = () => {
  const { collections: venues, isLoading = false } = useSelector(
      ({ venues }) => venues,
    ),
    [currentPage, setCurrentPage] = useState(1),
    dispatch = useDispatch();

  const totalPages = Math.ceil(venues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleVenues = useMemo(
    () => venues.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex, venues],
  );
  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);
  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const renderPagination = (placement) => (
    <nav className={`venue-pagination venue-pagination--${placement}`}>
      <Button
        aria-label="Previous venues"
        className="venue-pagination__arrow"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        size="icon"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      <div className="venue-pagination__pages">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Button
              aria-current={currentPage === page ? "page" : undefined}
              className="venue-pagination__page"
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
        className="venue-pagination__arrow"
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
    <section className="venue-page">
      <div className="venue-page__inner">
        <div className="venue-reservation">
          {renderPagination("top")}

          <div className="venue-reservation__grid">
            {!isLoading
              ? visibleVenues.map((venue) => {
                  return <Item key={venue?._id} venue={venue} />;
                })
              : Array.from({ length: 3 }).map((_, idx) => (
                  <VenueSkeleton key={idx} />
                ))}
          </div>

          {renderPagination("bottom")}
        </div>
      </div>
    </section>
  );
};

export default Venue;
