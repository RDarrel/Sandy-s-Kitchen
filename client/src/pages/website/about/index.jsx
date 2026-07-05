import { HeartHandshake, MapPin, Sparkles, Utensils } from "lucide-react";
import cateringImage from "../../../assets/about/catering.jpg";
import pinImage from "./images/pin.png";
import storyCustomersImage from "./images/story/customers.jpg";
import storyExteriorImage from "./images/story/exterior.jpg";
import storyInteriorImage from "./images/story/interior.jpg";
import storyOwnerImage from "./images/story/owner.jpg";
import "./style.css";

const About = () => {
  const timeline = [
    {
      label: "Our Story",
      title: "Sandy's Kitchenette",
      text: "Sandy's Kitchenette brings together home-style cooking, friendly service, and a cozy venue for guests who want meals and gatherings that feel easy, personal, and close to home.",
      images: [
        {
          src: storyExteriorImage,
          alt: "Exterior view of Sandy's Kitchenette",
        },
        {
          src: storyInteriorImage,
          alt: "Interior dining space of Sandy's Kitchenette",
        },
        {
          src: storyOwnerImage,
          alt: "Sandy's Kitchenette owner",
        },
        {
          src: storyCustomersImage,
          alt: "Guests at Sandy's Kitchenette",
        },
      ],
    },
    {
      label: "Our Mission",
      title: "Built for everyday cravings and the moments worth gathering for.",
      text: "We serve people who want more than just a place to eat. Some visit for a comforting meal, some inquire about food packages, and others reserve the venue for a celebration. In every part of the experience, our goal is to keep things welcoming, organized, and worth remembering.",
      image: {
        src: cateringImage,
        alt: "Catering setup at Sandy's Kitchenette",
      },
    },
    {
      label: "Our Services",
      title: "Food, service, and a space that works for real gatherings.",
      text: "From dine-in favorites to catering requests and venue reservations, Sandy's Kitchenette is shaped around practical needs, warm details, and food people can share.",
      cards: [
        {
          icon: <Utensils />,
          title: "Home-Style Meals",
          text: "Comforting dishes prepared for dine-in visits, family meals, and casual celebrations.",
        },
        {
          icon: <HeartHandshake />,
          title: "Warm Assistance",
          text: "Helpful service from simple food orders to catering and venue reservation details.",
        },
        {
          icon: <MapPin />,
          title: "Gathering Space",
          text: "A welcoming venue for birthdays, meetings, small events, and meaningful moments.",
        },
      ],
    },
    {
      label: "Visit Us",
      title: "Still growing through meals shared and celebrations remembered.",
      text: "Today, we continue serving guests with the same warm, personal touch: hearty meals, thoughtful catering, and a place where simple celebrations can feel special.",
    },
  ];

  return (
    <section className="about-page">
      <div className="about-page__inner">
        <div
          className="about-page__timeline"
          aria-label="About Sandy's Kitchenette timeline"
        >
          {timeline.map(({ cards, image, images, label, text, title }) => (
            <article className="about-page__item" key={label}>
              <div className="about-page__heading">
                <div className="about-page__marker" />
                <p className="about-page__label">
                  <Sparkles />
                  {label}
                </p>
              </div>

              <div className="about-page__content">
                <h1>{title}</h1>
                <p className="about-page__text">{text}</p>

                {images ? (
                  <div className="about-page__images">
                    {images.map(({ alt, src }) => (
                      <figure className="about-page__photo" key={alt}>
                        <img
                          alt=""
                          aria-hidden="true"
                          className="about-page__pin"
                          src={pinImage}
                        />
                        <img alt={alt} src={src} />
                      </figure>
                    ))}
                  </div>
                ) : null}

                {image ? (
                  <div className="about-page__image">
                    <img alt={image.alt} src={image.src} />
                  </div>
                ) : null}

                {cards ? (
                  <div className="about-page__cards">
                    {cards.map(({ icon, text: cardText, title: cardTitle }) => (
                      <div className="about-page__card" key={cardTitle}>
                        <span>{icon}</span>
                        <h2>{cardTitle}</h2>
                        <p>{cardText}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
