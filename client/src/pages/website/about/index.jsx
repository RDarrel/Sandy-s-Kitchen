import { HeartHandshake, MapPin, Sparkles, Utensils } from "lucide-react";
import cateringImage from "../../../assets/about/catering.jpg";
import storyCustomersImage from "./images/story/customers.jpg";
import storyExteriorImage from "./images/story/exterior.jpg";
import storyInteriorImage from "./images/story/interior.jpg";
import storyOwnerImage from "./images/story/owner.jpg";
import "./style.css";

const About = () => {
  const timeline = [
    {
      label: "Our Story",
      title:
        "A kitchenette built around comfort, food, and familiar gatherings.",
      text: "Sandy's Kitchenette started as a place where guests could enjoy home-style meals in a warm, welcoming space. From simple dine-in visits to small celebrations, every detail is shaped to feel personal, relaxed, and close to home.",
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
      title: "To make good food and meaningful celebrations easier to enjoy.",
      text: "Our mission is to serve comforting meals, thoughtful catering, and a cozy venue with care in every step. Whether it is an everyday craving or a planned event, we want guests to feel assisted, welcomed, and well taken care of.",
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
      label: "Our Services",
      title:
        "Dine-in meals, catering support, and a venue ready for real moments.",
      text: "We offer food and service for different needs: casual meals, packed food requests, catering arrangements, and venue reservations for birthdays, meetings, family gatherings, and simple celebrations.",
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
      label: "Visit Us",
      title: "Come by for a meal, an inquiry, or your next celebration.",
      text: "Visit Sandy's Kitchenette to explore our food, ask about catering packages, or reserve the space for your next gathering. We are here to help make every visit feel easy, warm, and worth coming back to.",
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
                        <span aria-hidden="true" className="about-page__pin" />
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
