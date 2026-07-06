import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import venueImage from "../../../assets/about/venue.jpg";
import celebrationImage from "../../../assets/whyChoose/celebration.jpg";
import diningImage from "../../../assets/whyChoose/dining.jpg";
import privateVenueImage from "../../../assets/whyChoose/venue.jpg";
import "./style.css";

const onlineVenueImages = {
  banquet:
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  dining:
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  tables:
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
  reception:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
  hall:
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=900&q=80",
};

const venueOptions = [
  {
    name: "Main Celebration Area",
    rate: "PHP 5,000",
    rateLabel: "starting rate",
    capacity: "Up to 70 guests",
    duration: "4-hour use",
    description:
      "Wide dining hall setup for bigger celebrations with flexible table arrangement.",
    images: [
      venueImage,
      onlineVenueImages.banquet,
      onlineVenueImages.tables,
      onlineVenueImages.reception,
    ],
    bestFor: ["Birthdays", "Family gatherings", "Baptisms"],
    includes: [
      "Tables and chairs",
      "Basic venue setup",
      "Decor-ready space",
      "Staff assistance",
      "Guest entrance assistance",
      "Cleaning after event",
    ],
  },
  {
    name: "Private Dining Setup",
    rate: "PHP 3,500",
    rateLabel: "starting rate",
    capacity: "Up to 35 guests",
    duration: "3-hour use",
    description:
      "A quieter reserved area for smaller groups, meetings, and private meals.",
    images: [
      diningImage,
      onlineVenueImages.dining,
      onlineVenueImages.tables,
      onlineVenueImages.hall,
    ],
    bestFor: ["Meetings", "Small celebrations", "Team meals"],
    includes: [
      "Reserved dining area",
      "Table arrangement",
      "Basic sound support",
      "Dining coordination",
      "Service water station",
      "Private service crew",
    ],
  },
  {
    name: "Styled Event Setup",
    rate: "PHP 8,000",
    rateLabel: "starting rate",
    capacity: "Up to 90 guests",
    duration: "5-hour use",
    description:
      "A decorated event-ready space for programs, photo moments, and formal gatherings.",
    images: [
      celebrationImage,
      onlineVenueImages.reception,
      onlineVenueImages.banquet,
      onlineVenueImages.hall,
    ],
    bestFor: ["Debuts", "Anniversaries", "Company events"],
    includes: [
      "Venue styling area",
      "Guest table setup",
      "Program space",
      "Event timing support",
      "Backdrop area",
      "Gift table",
      "Registration table",
      "Basic lights",
      "Sound system support",
      "Cleanup assistance",
    ],
  },
  {
    name: "Intimate Venue Corner",
    rate: "PHP 2,500",
    rateLabel: "starting rate",
    capacity: "Up to 20 guests",
    duration: "2-hour use",
    description:
      "A compact corner for simple celebrations, quick meetups, and intimate dining.",
    images: [
      privateVenueImage,
      onlineVenueImages.dining,
      onlineVenueImages.tables,
      onlineVenueImages.reception,
    ],
    bestFor: ["Small family meals", "Meetups", "Simple gatherings"],
    includes: [
      "Reserved corner",
      "Compact table setup",
      "Photo-friendly space",
      "Service assistance",
    ],
  },
];

const ITEMS_PER_PAGE = 3;

const Venue = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(venueOptions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleVenues = useMemo(
    () => venueOptions.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex],
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

  return (
    <section className="venue-page">
      <div className="venue-page__inner">
        <div className="venue-reservation">
          {renderPagination("top")}

          <div className="venue-reservation__grid">
            {visibleVenues.map((venue) => (
              <article className="venue-card" key={venue.name}>
                <div className="venue-card__gallery">
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="venue-card__main-image"
                  />
                  <div className="venue-card__thumbs">
                    {venue.images.slice(1, 4).map((image, index) => (
                      <img
                        src={image}
                        alt={`${venue.name} preview ${index + 2}`}
                        key={image}
                      />
                    ))}
                  </div>
                </div>

                  <div className="venue-card__body">
                    <div className="venue-card__top">
                      <div>
                        <h2>{venue.name}</h2>
                        <p>
                        <MapPin />
                        Sandy&apos;s Kitchenette venue space
                      </p>
                      <small>{venue.description}</small>
                    </div>

                    <div className="venue-card__rate">
                      <strong>{venue.rate}</strong>
                      <small>{venue.rateLabel}</small>
                    </div>
                  </div>

                  <div className="venue-card__meta">
                    <span>
                      <UsersRound />
                      <small>Capacity</small>
                      <strong>{venue.capacity}</strong>
                    </span>
                    <span>
                      <Clock />
                      <small>Duration</small>
                      <strong>{venue.duration}</strong>
                    </span>
                  </div>

                  <div className="venue-card__details">
                    <div>
                      <h3>Best for</h3>
                      <div className="venue-card__chips">
                        {venue.bestFor.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3>Included</h3>
                      <ul>
                        {venue.includes.map((item) => (
                          <li key={item}>
                            <Check />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button className="venue-card__button" variant="outline">
                    Inquire Venue
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {renderPagination("bottom")}
        </div>
      </div>
    </section>
  );
};

export default Venue;
