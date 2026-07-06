import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ListChecks,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import classicBuffetImage from "../../../assets/whyChoose/foods.jpg";
import celebrationImage from "../../../assets/whyChoose/celebration.jpg";
import staffImage from "../../../assets/whyChoose/staffs.jpg";
import cateringImage from "../../../assets/about/catering.jpg";
import diningImage from "../../../assets/whyChoose/dining.jpg";
import venueImage from "../../../assets/whyChoose/venue.jpg";
import "./style.css";

const packages = [
  {
    name: "Classic Handaan",
    tag: "Budget Friendly",
    price: "PHP 395",
    unit: "per package",
    minimum: "Minimum 30 guests",
    image: classicBuffetImage,
    description:
      "A simple, reliable buffet package for birthdays, reunions, and small family gatherings.",
    inclusions: [
      "3 main dishes",
      "1 pasta or noodle tray",
      "Steamed rice",
      "Iced tea",
      "Basic buffet setup",
      "Disposable utensils",
      "Serving spoons",
      "Food labels",
    ],
  },
  {
    name: "Family Celebration",
    tag: "Best Seller",
    price: "PHP 485",
    unit: "per package",
    minimum: "Minimum 40 guests",
    image: celebrationImage,
    description:
      "A fuller spread for family milestones, baptisms, birthdays, and intimate celebrations.",
    inclusions: [
      "4 main dishes",
      "1 pasta or noodle tray",
      "Dessert tray",
      "Iced tea or juice",
      "Styled buffet table",
      "Basic table centerpiece",
    ],
  },
  {
    name: "Corporate Buffet",
    tag: "Office Ready",
    price: "PHP 525",
    unit: "per package",
    minimum: "Minimum 50 guests",
    image: diningImage,
    description:
      "A practical package for meetings, seminars, team lunches, and company gatherings.",
    inclusions: [
      "4 main dishes",
      "Rice and pasta",
      "Packed drinks",
      "Buffet labels",
      "Delivery coordination",
    ],
  },
  {
    name: "Premium Feast",
    tag: "Premium",
    price: "PHP 645",
    unit: "per package",
    minimum: "Minimum 60 guests",
    image: cateringImage,
    description:
      "A polished buffet with more variety for debuts, anniversaries, and special occasions.",
    inclusions: [
      "5 main dishes",
      "Soup or salad",
      "Dessert station",
      "Signature drinks",
      "Styled buffet setup",
    ],
  },
  {
    name: "Venue Banquet",
    tag: "With Venue",
    price: "PHP 720",
    unit: "per package",
    minimum: "Minimum 70 guests",
    image: venueImage,
    description:
      "A catering and venue-ready package for guests who want one coordinated celebration.",
    inclusions: [
      "5 main dishes",
      "Venue table setup",
      "Buffet attendants",
      "Basic table styling",
      "Event timing support",
    ],
  },
  {
    name: "Full Service Banquet",
    tag: "Complete Setup",
    price: "PHP 850",
    unit: "per package",
    minimum: "Minimum 80 guests",
    image: staffImage,
    description:
      "A complete service package for weddings, company events, and larger private gatherings.",
    inclusions: [
      "6 main dishes",
      "Soup, salad, and dessert",
      "Guest table setup",
      "Service crew",
      "Event coordination support",
    ],
  },
  {
    name: "Simple Food Trays",
    price: "PHP 320",
    unit: "per package",
    minimum: "Minimum 20 guests",
    image: classicBuffetImage,
    description:
      "A practical food tray package for casual meals, office snacks, and small gatherings.",
    inclusions: ["2 main dishes", "Steamed rice", "Pasta tray", "Iced tea"],
  },
];

const ITEMS_PER_PAGE = 3;
const MAX_VISIBLE_INCLUSIONS = 6;
const MAX_VISIBLE_INCLUSIONS_WITH_MORE = 5;

const Catering = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePackages = useMemo(
    () => packages.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [startIndex],
  );

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const renderPagination = (placement) => (
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

  return (
    <section className="catering-page">
      <div className="catering-page__inner">
        {renderPagination("top")}

        <div className="catering-packages">
          {visiblePackages.map((item) => {
            const hasHiddenInclusions =
              item.inclusions.length > MAX_VISIBLE_INCLUSIONS;
            const visibleLimit = hasHiddenInclusions
              ? MAX_VISIBLE_INCLUSIONS_WITH_MORE
              : MAX_VISIBLE_INCLUSIONS;
            const visibleInclusions = item.inclusions.slice(0, visibleLimit);
            const hiddenInclusions =
              item.inclusions.length - visibleInclusions.length;

            return (
              <article className="catering-package" key={item.name}>
                <div className="catering-package__media">
                  <img alt={`${item.name} catering package`} src={item.image} />
                </div>

                <div className="catering-package__body">
                  <div className="catering-package__content">
                    <div className="catering-package__heading">
                      {item.tag && <span>{item.tag}</span>}
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                    </div>

                    <div className="catering-package__price">
                      <strong>{item.price}</strong>
                      <small>{item.unit}</small>
                    </div>
                  </div>

                  <div className="catering-package__summary">
                    <span>
                      <UsersRound />
                      {item.minimum}
                    </span>
                    <span>
                      <ListChecks />
                      {item.inclusions.length} inclusions
                    </span>
                  </div>

                  <ul className="catering-package__inclusions">
                    {visibleInclusions.map((inclusion) => (
                      <li key={inclusion}>
                        <Check />
                        {inclusion}
                      </li>
                    ))}
                    {hasHiddenInclusions && (
                      <li className="catering-package__more">
                        +{hiddenInclusions} more
                      </li>
                    )}
                  </ul>

                  <Button
                    className="catering-package__button"
                    variant="outline"
                  >
                    Inquire Package
                  </Button>
                </div>
              </article>
            );
          })}
        </div>

        {renderPagination("bottom")}
      </div>
    </section>
  );
};

export default Catering;
