import {
  BadgeCheck,
  ChefHat,
  HeartHandshake,
  MapPin,
  Sparkles,
  Utensils,
} from "lucide-react";
import cateringImage from "../../../assets/whyChoose/catering.jpg";
import celebrationImage from "../../../assets/whyChoose/celebration.jpg";
import diningImage from "../../../assets/whyChoose/dining.jpg";
import foodsImage from "../../../assets/whyChoose/foods.jpg";
import "./style.css";

const WhyChoose = () => {
  const reasons = [
    {
      icon: <HeartHandshake />,
      image: cateringImage,
      title: "Catering handled with care",
      label: "Book catering",
      text: "Food service, setup support, and a team that keeps events organized.",
    },
    {
      icon: <Sparkles />,
      image: diningImage,
      title: "Venue ready for gatherings",
      label: "Reserve venue",
      text: "A cozy space for birthdays, meetings, family events, and private moments.",
    },
    {
      icon: <ChefHat />,
      image: foodsImage,
      title: "Dine-in comfort meals",
      label: "Visit us",
      text: "Hearty meals are available for guests who want to dine at the venue.",
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
            Catering packages and venue reservations made easy.
          </h2>

          <p className="why-choose__lead">
            Sandy's Kitchenette helps you plan celebrations with reliable
            catering, a welcoming venue, and dine-in meals available for guests
            who visit.
          </p>
        </div>

        <div className="why-choose__showcase">
          <article className="why-choose__feature">
            <img
              src={celebrationImage}
              alt="Celebration setup by Sandy's Kitchenette"
              className="why-choose__feature-image"
            />
            <div className="why-choose__feature-copy">
              <div className="why-choose__seal">
                <BadgeCheck />
                <span>Trusted for catering and venue reservations</span>
              </div>
              <h3>Catering and venue details prepared for your celebration.</h3>
              <p>
                Book food service and reserve a warm space for birthdays,
                meetings, family gatherings, and private celebrations.
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
            <span>Venue reservation for private gatherings</span>
          </div>
          <div>
            <BadgeCheck />
            <span>Catering packages for special events</span>
          </div>
          <div>
            <Sparkles />
            <span>Dine-in meals available at the venue</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
