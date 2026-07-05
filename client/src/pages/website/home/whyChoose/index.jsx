import {
  BadgeCheck,
  ChefHat,
  HeartHandshake,
  MapPin,
  Utensils,
} from "lucide-react";
import cateringImage from "../../../../assets/whyChoose/catering.jpg";
import celebrationImage from "../../../../assets/whyChoose/celebration.jpg";
import foodsImage from "../../../../assets/whyChoose/foods.jpg";
import staffsImage from "../../../../assets/whyChoose/staffs.jpg";
import venueImage from "../../../../assets/whyChoose/venue.jpg";
import diningImage from "../../../../assets/whyChoose/dining.jpg";
import "./style.css";

const WhyChoose = () => {
  const features = [
    {
      icon: <HeartHandshake />,
      image: {
        src: staffsImage,
        alt: "Sandy's Kitchenette catering team with buffet setup",
      },
      insetImage: {
        src: cateringImage,
        alt: "Catering venue setup",
      },
      title: "Less stress from planning to serving",
      label: "Stress-Free Planning",
      text: "You get food preparation, buffet coordination, and serving support from one team, so your event feels organized from setup to cleanup.",
      action: "Plan with confidence",
    },
    {
      icon: <MapPin />,
      image: {
        src: celebrationImage,
        alt: "Celebration setup by Sandy's Kitchenette",
      },
      insetImage: {
        src: venueImage,
        alt: "Sandy's Kitchenette venue seating area",
      },
      title: "A celebration space that feels ready",
      label: "Beautifully Prepared Venue",
      text: "The place is arranged to welcome guests, take photos, share meals, and celebrate comfortably without starting from an empty room.",
      action: "Celebrate with ease",
      reverse: true,
    },
    {
      icon: <ChefHat />,
      image: {
        src: foodsImage,
        alt: "Dine-in meals at Sandy's Kitchenette",
      },
      insetImage: {
        src: diningImage,
        alt: "Sandy's Kitchenette dining area",
      },
      title: "Food your guests can actually enjoy",
      label: "Delicious Food Everyone Loves",
      text: "Whether guests come for an event or a simple dine-in visit, they are welcomed with fresh, familiar meals and a comfortable dining setting.",
      action: "Serve guests well",
    },
  ];

  return (
    <section className="why-choose" id="why-choose">
      <div className="why-choose__inner">
        <div className="why-choose__header">
          <div className="why-choose__heading">
            <p className="why-choose__eyebrow">
              <Utensils />
              Why Choose Sandy's Kitchenette
            </p>

            <h2 className="why-choose__title">
              Celebrate with fewer worries and better care.
            </h2>
          </div>

          <div className="why-choose__summary">
            <p className="why-choose__lead">
              Choose a team that helps make gatherings feel easier, warmer, and
              more memorable for the people around your table.
            </p>

            <div className="why-choose__seal">
              <BadgeCheck />
              <span>One trusted place for food, venue, and guest comfort</span>
            </div>
          </div>
        </div>

        <div className="why-choose__features">
          {features.map(
            (
              { icon, image, insetImage, title, label, text, action, reverse },
              index,
            ) => (
              <article
                className={`why-choose__feature why-choose__feature--${index + 1}${
                  reverse ? " why-choose__feature--reverse" : ""
                }`}
                key={title}
              >
                <div className="why-choose__media">
                  <figure className="why-choose__image">
                    <img src={image.src} alt={image.alt} />
                  </figure>
                  <figure className="why-choose__image-inset">
                    <img src={insetImage.src} alt={insetImage.alt} />
                  </figure>
                </div>

                <div className="why-choose__feature-copy">
                  <div className="why-choose__topline">
                    <span className="why-choose__icon">{icon}</span>
                    <span>{label}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="why-choose__action">{action}</span>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
