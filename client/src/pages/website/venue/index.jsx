import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/venues";
import Item from "./item";
import VenueSkeleton from "./item/skeleton";
import "./style.css";
import DatePicker from "@/components/shared/datePicker";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 4;

const Venue = ({ isWebsite = true, onSelect = () => {} }) => {
  const { auth } = useSelector(({ auth }) => auth),
    { collections: venues, isLoading = false } = useSelector(
      ({ venues }) => venues,
    ),
    [currentPage, setCurrentPage] = useState(1),
    navigate = useNavigate(),
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

  const handleInquire = useCallback((item, actionType) => {
    if (!isWebsite) return onSelect(item, actionType);
    sessionStorage.setItem(
      "inquiry",
      JSON.stringify({
        type: "venue",
        id: item._id,
      }),
    );
    navigate("/authentication/sign-in");
  }, []);
  return (
    <section className="venue-page grid grid-cols-1 md:grid-cols-[auto_1fr] max-w-6xl mx-auto gap-5 items-start">
      <div
        className={cn(
          `sticky hidden md:block w-60 self-start rounded-md border bg-card p-4 shadow-sm z-10 `,
          auth?._id ? "top-4" : "top-[88px]",
        )}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Find Your Venue</h3>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Find the perfect venue for your event.
          </p>
        </div>

        <div className="space-y-4">
          {/* Number of Guests */}
          <div className="grid gap-2">
            <Label>Number of Guests</Label>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="1-30">1–30 guests</SelectItem>
                <SelectItem value="31-50">31–50 guests</SelectItem>
                <SelectItem value="51-100">51–100 guests</SelectItem>
                <SelectItem value="101-150">101–150 guests</SelectItem>
                <SelectItem value="150+">150+ guests</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Type */}
          <div className="grid gap-2">
            <Label>Event Type</Label>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="birthday">Birthday Party</SelectItem>
                <SelectItem value="debut">Debut</SelectItem>
                <SelectItem value="christening">
                  Christening / Baptism
                </SelectItem>
                <SelectItem value="corporate">Corporate Event</SelectItem>
                <SelectItem value="seminar">Seminar / Training</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="team-building">Team Building</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="grid gap-2">
            <Label>Budget</Label>

            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="under-15k">Under ₱15,000</SelectItem>
                <SelectItem value="15k-30k">₱15,000 – ₱30,000</SelectItem>
                <SelectItem value="30k-50k">₱30,000 – ₱50,000</SelectItem>
                <SelectItem value="50k-plus">₱50,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Date */}
          <div className="grid gap-2">
            <Label>When is your event?</Label>
            <DatePicker />
          </div>

          <hr />

          {/* Sort By */}
          <div className="grid gap-2">
            <Label>Sort By</Label>

            <Select defaultValue="default">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="default">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <div className="grid gap-2">
            <Button className="w-full">Find Venues</Button>

            <Button variant="ghost" className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      <div className="venue-page__innerr">
        <div className="venue-reservation">
          {renderPagination("top")}

          <div className="venue-reservation__grid">
            {!isLoading
              ? visibleVenues.map((venue) => {
                  return (
                    <Item
                      key={venue?._id}
                      venue={venue}
                      handleInquire={handleInquire}
                      isWebsite={isWebsite}
                    />
                  );
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
