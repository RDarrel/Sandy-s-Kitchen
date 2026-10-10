import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Item from "./item";
import VenueSkeleton from "./item/skeleton";
import "./style.css";
import { useNavigate } from "react-router-dom";
import Search from "../search";
import EmptyVenue from "./empty";

const ITEMS_PER_PAGE = 4;

const VenueList = ({ isWebsite = true, onSelect = () => {} }) => {
  const { collections: venues, isLoading = false } = useSelector(
      ({ venues }) => venues,
    ),
    [currentPage, setCurrentPage] = useState(1),
    navigate = useNavigate();

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

  const handleInquire = useCallback((item, actionType) => {
    if (!isWebsite) return onSelect(item, actionType);
    sessionStorage.setItem(
      "venueDraft",
      JSON.stringify({
        selected: item,
        isAutomaticRedirect: true,
      }),
    );
    sessionStorage.removeItem("cateringDraft");
    navigate("/authentication/sign-in");
  }, []);
  return (
    <section className="venue-page grid grid-cols-1 md:grid-cols-[auto_1fr] max-w-6xl mx-auto gap-5 items-start">
      <Search />
      <div className="venue-page__innerr">
        <div className="venue-reservation">
          {renderPagination("top")}

          <div className="venue-reservation__grid">
            {!isLoading ? (
              visibleVenues?.length > 0 ? (
                visibleVenues.map((venue) => {
                  return (
                    <Item
                      key={venue?._id}
                      venue={venue}
                      handleInquire={handleInquire}
                      isWebsite={isWebsite}
                    />
                  );
                })
              ) : (
                <EmptyVenue />
              )
            ) : (
              Array.from({ length: 3 }).map((_, idx) => (
                <VenueSkeleton key={idx} />
              ))
            )}
          </div>

          {renderPagination("bottom")}
        </div>
      </div>
    </section>
  );
};

export default VenueList;
