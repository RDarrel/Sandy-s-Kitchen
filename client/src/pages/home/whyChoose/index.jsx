import {
  BadgeCheck,
  ChefHat,
  HeartHandshake,
  MapPin,
  Utensils,
} from "lucide-react";
import cateringImage from "../../../assets/whyChoose/catering.jpg";
import celebrationImage from "../../../assets/whyChoose/celebration.jpg";
import diningImage from "../../../assets/whyChoose/dining.jpg";
import foodsImage from "../../../assets/whyChoose/foods.jpg";
import staffsImage from "../../../assets/whyChoose/staffs.jpg";
import "./style.css";

const WhyChoose = () => {
  const features = [
    {
      icon: <HeartHandshake />,
      images: [
        {
          src: staffsImage,
          alt: "Sandy's Kitchenette catering team with buffet setup",
        },
        {
          src: cateringImage,
          alt: "Catering venue setup",
        },
      ],
      title: "Event catering, handled end to end",
      label: "Catering",
      text: "Buffet service, plated meals, and setup support for birthdays, meetings, family gatherings, and private events.",
      action: "Food service with a team",
    },
    {
      icon: <MapPin />,
      images: [
        {
          src: celebrationImage,
          alt: "Celebration setup by Sandy's Kitchenette",
        },
      ],
      title: "A venue dressed for milestones",
      label: "Venue",
      text: "A warm, prepared space for birthdays, baptisms, meetings, and intimate celebrations, with details ready before guests arrive.",
      action: "Reserve a celebration space",
      reverse: true,
    },
    {
      icon: <ChefHat />,
      images: [
        {
          src: diningImage,
          alt: "Sandy's Kitchenette dining area",
        },
        {
          src: foodsImage,
          alt: "Dine-in meals at Sandy's Kitchenette",
        },
      ],
      title: "Fresh meals for visiting guests",
      label: "Dine-in",
      text: "Hearty plates and comfort meals are still served at Sandy's Kitchenette for guests who want to dine in.",
      action: "Available at the venue",
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
              Food, venue, and service ready for your event.
            </h2>
          </div>

          <div className="why-choose__summary">
            <p className="why-choose__lead">
              Sandy's Kitchenette brings together event catering, a welcoming
              celebration space, and dine-in meals for guests who visit.
            </p>

            <div className="why-choose__seal">
              <BadgeCheck />
              <span>Catering first, venue next, dine-in for visiting guests</span>
            </div>
          </div>
        </div>

        <div className="why-choose__features">
          {features.map(({ icon, images, title, label, text, action, reverse }, index) => (
            <article
              className={`why-choose__feature why-choose__feature--${index + 1}${
                reverse ? " why-choose__feature--reverse" : ""
              }`}
              key={title}
            >
              <div
                className={`why-choose__media${
                  images.length > 1 ? " why-choose__media--pair" : ""
                }`}
              >
                {images.map(({ src, alt }) => (
                  <figure className="why-choose__image" key={alt}>
                    <img src={src} alt={alt} />
                  </figure>
                ))}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
