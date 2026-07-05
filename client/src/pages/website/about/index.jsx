import { HeartHandshake, MapPin, Sparkles, Utensils } from "lucide-react";
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
        "A kitchenette for dining, catering, and meaningful gatherings.",
      text: "Sandy's Kitchenette was created as a warm place where guests can enjoy comforting dine-in meals, book food for special occasions, and gather in a cozy venue that feels personal and welcoming.",
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
      title: "To make good food and simple celebrations easier to plan.",
      text: "Our mission is to provide satisfying dining experiences, reliable catering support, and a comfortable venue for guests who want their celebrations to feel organized, warm, and stress-free.",
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
        "Dining, catering, and venue reservations in one welcoming place.",
      text: "Guests can visit us for dine-in meals, inquire about catering packages, or reserve our venue for birthdays, meetings, family gatherings, and other intimate celebrations.",
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
      title: "Visit us for dining, catering inquiries, or venue reservations.",
      text: "Come to Sandy's Kitchenette to enjoy a meal, discuss catering options, or plan your next gathering in our venue. We are here to help make each visit easy, welcoming, and worth remembering.",
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
