import { ChefHat, Sparkles } from "lucide-react";
import cateringImage from "../../../../assets/about/catering.jpg";
import foodImage from "../../../../assets/about/food.jpg";
import "./style.css";

const About = () => {
  const storyBlocks = [
    {
      title: "What We Are",
      text: "A warm kitchenette for hearty meals, simple celebrations, and cozy gatherings.",
    },
    {
      title: "What We Do",
      text: "We serve dine-in favorites, catering packages, and venue reservations for special moments.",
    },
  ];

  return (
    <section className="about" id="about">
      <div className="about__inner">
        <div className="about__media" aria-label="Sandy's Kitchenette dining">
          <img
            src={foodImage}
            alt="Prepared food from Sandy's Kitchenette"
            className="about__image about__image--main"
          />

          <div className="about__image-card">
            <img
              src={cateringImage}
              alt="Catering setup at Sandy's Kitchenette"
              className="about__image"
            />
          </div>

          <div className="about__badge">
            <ChefHat />
            <span>Made with care</span>
          </div>
        </div>

        <div className="about__content">
          <p className="about__eyebrow">
            <Sparkles />
            Welcome to Sandy's Kitchenette
          </p>

          <h2 className="about__title">
            Comfort food and celebrations that feel close to home.
          </h2>

          <p className="about__lead">
            Sandy's Kitchenette brings together good food, thoughtful catering,
            and a welcoming venue for families, friends, and special gatherings.
          </p>

          <div className="about__story">
            {storyBlocks.map(({ title, text }) => (
              <article className="about__story-item" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
