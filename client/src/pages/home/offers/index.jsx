import { Button } from "@/components/ui/button";
import { CalendarCheck, MapPin, Utensils } from "lucide-react";
import cateringImage from "../../../assets/about/catering.jpg";
import foodImage from "../../../assets/about/food.jpg";
import venueImage from "../../../assets/about/venue.jpg";
import "./style.css";

const Offers = () => {
  const offers = [
    {
      icon: <CalendarCheck />,
      image: cateringImage,
      title: "Catering Packages",
      label: "For Events",
      text: "Food trays and event packages prepared for birthdays, weddings, meetings, and family celebrations.",
      action: "Book Catering",
      featured: true,
    },
    {
      icon: <Utensils />,
      image: foodImage,
      title: "Dine-In Meals",
      label: "Daily Favorites",
      text: "Comforting meals served fresh for everyday cravings and family dining.",
      action: "View Dining",
    },
    {
      icon: <MapPin />,
      image: venueImage,
      title: "Venue Reservation",
      label: "Private Gatherings",
      text: "A cozy space for simple celebrations and special occasions.",
      action: "Reserve Venue",
    },
  ];

  return (
    <section className="offers" id="offers">
      <div className="offers__inner">
        <div className="offers__header">
          <div>
            <p className="offers__eyebrow">What We Offer</p>
            <h2 className="offers__title">
              Good food, warm service, easy plans.
            </h2>
          </div>
          <p className="offers__lead">
            Choose the service that fits your next meal, event, or celebration.
          </p>
        </div>

        <div className="offers__grid">
          {offers.map(({ icon, image, title, label, text, action, featured }) => (
            <article
              className={`offers__card${featured ? " offers__card--featured" : ""}`}
              key={title}
            >
              <img src={image} alt={title} className="offers__image" />
              <div className="offers__overlay" />

              <div className="offers__content">
                <div className="offers__topline">
                  <div className="offers__icon">{icon}</div>
                  <span>{label}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <Button
                  className="offers__button"
                  variant={featured ? "default" : "outline"}
                >
                  {action}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
