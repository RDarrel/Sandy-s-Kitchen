import {
  BadgeCheck,
  ChefHat,
  HeartHandshake,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";
import celebrationImage from "../../../assets/whyChoose/celebration.jpg";
import diningImage from "../../../assets/whyChoose/dining.jpg";
import foodsImage from "../../../assets/whyChoose/foods.jpg";
import staffsImage from "../../../assets/whyChoose/staffs.jpg";
import "./style.css";

const WhyChoose = () => {
  const reasons = [
    {
      icon: <ChefHat />,
      image: foodsImage,
      title: "Fresh, generous plates",
      label: "Comfort food",
      text: "Hearty servings, familiar flavors, and meals prepared with care.",
    },
    {
      icon: <HeartHandshake />,
      image: staffsImage,
      title: "Hands-on event care",
      label: "Catering team",
      text: "Friendly service that keeps gatherings organized and welcoming.",
    },
    {
      icon: <Sparkles />,
      image: celebrationImage,
      title: "Celebrations made polished",
      label: "Special occasions",
      text: "Thoughtful setup details for birthdays, meetings, and family moments.",
    },
  ];

  return (
    <section className="why-choose" id="why-choose">
      <div className="why-choose__inner">
        <div className="why-choose__header">
          <p className="why-choose__eyebrow">
            <Utensils />
            Why Choose Sandy's Kitchenette
          </p>

          <h2 className="why-choose__title">
            Premium comfort food, cozy dining, and events made easy.
          </h2>

          <p className="why-choose__lead">
            From everyday cravings to milestone celebrations, Sandy's
            Kitchenette brings together comforting food, attentive service, and
            a warm venue that makes guests feel looked after.
          </p>
        </div>

        <div className="why-choose__showcase">
          <article className="why-choose__feature">
            <img
              src={diningImage}
              alt="Sandy's Kitchenette dining area"
              className="why-choose__feature-image"
            />
            <div className="why-choose__feature-copy">
              <div className="why-choose__seal">
                <BadgeCheck />
                <span>Trusted for meals and events</span>
              </div>
              <h3>A place that feels ready for family meals and celebrations.</h3>
              <p>
                Enjoy a warm space, generous food, and simple planning for
                dine-in days, catered events, and private gatherings.
              </p>
            </div>
          </article>

          <div className="why-choose__reasons">
            {reasons.map(({ icon, image, title, label, text }) => (
              <article className="why-choose__reason" key={title}>
                <img src={image} alt={title} className="why-choose__thumb" />
                <div className="why-choose__reason-copy">
                  <div className="why-choose__topline">
                    <span className="why-choose__icon">{icon}</span>
                    <span>{label}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="why-choose__notes">
          <div>
            <MapPin />
            <span>Cozy venue for simple gatherings</span>
          </div>
          <div>
            <BadgeCheck />
            <span>Prepared for dine-in and catering</span>
          </div>
          <div>
            <Sparkles />
            <span>Styled details for memorable moments</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
