import { Button } from "@/components/ui/button";
import { CalendarCheck, MapPin, Utensils } from "lucide-react";
import cateringImage from "../../../assets/about/catering.jpg";
import foodImage from "../../../assets/about/food.jpg";
import venueImage from "../../../assets/about/venue.jpg";
import "./style.css";

const Offers = () => {
  const offers = [
    {
      icon: <Utensils />,
      image: foodImage,
      title: "Dine-In Meals",
      text: "Comforting favorites served fresh for everyday cravings and family meals.",
      action: "View Dining",
    },
    {
      icon: <CalendarCheck />,
      image: cateringImage,
      title: "Catering Packages",
      text: "Food trays and event packages prepared for birthdays, weddings, and meetings.",
      action: "Book Catering",
      featured: true,
    },
    {
      icon: <MapPin />,
      image: venueImage,
      title: "Venue Reservation",
      text: "A cozy space for private gatherings, simple celebrations, and special occasions.",
      action: "Reserve Venue",
    },
  ];

  return (
    <section className="offers" id="offers">
      <div className="offers__inner">
        <div className="offers__header">
          <p className="offers__eyebrow">What We Offer</p>
          <h2 className="offers__title">Good food, warm service, easy plans.</h2>
          <p className="offers__lead">
            Choose the service that fits your next meal, event, or celebration.
          </p>
        </div>

        <div className="offers__grid">
          {offers.map(({ icon, image, title, text, action, featured }) => (
            <article
              className={`offers__card${featured ? " offers__card--featured" : ""}`}
              key={title}
            >
              <img src={image} alt={title} className="offers__image" />
              <div className="offers__overlay" />

              <div className="offers__content">
                <div className="offers__icon">{icon}</div>
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
