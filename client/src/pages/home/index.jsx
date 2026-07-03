import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import bg1 from "../../assets/backgrounds/bg1.png";
import bg2 from "../../assets/backgrounds/bg2.png";
import bg3 from "../../assets/backgrounds/bg3.png";
import bg4 from "../../assets/backgrounds/bg4.png";

import logo from "../../assets/logos/kitchenette.jpg";

import "./index.css";

const backgrounds = [bg1, bg2, bg3, bg4];

const HomePage = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgrounds.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="hero">
        {backgrounds.map((background, index) => (
          <div
            key={index}
            className={`hero__bg ${
              currentImage === index ? "hero__bg--active" : ""
            }`}
            style={{
              backgroundImage: `url(${background})`,
            }}
          />
        ))}

        <div className="hero__overlay" />

        <nav className="navbar">
          <div className="navbar__content my-2">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Sandy's Kitchenette"
                className="navbar__logo"
              />

              {/* <h1 className="navbar__title">Sandy's Kitchenette</h1> */}
            </div>

            <div className="flex gap-5">
              <a className="text-secondary">Home</a>
              <a>Dining</a>
              <a>Catering</a>
              <a>Venue</a>
              <a>About</a>
            </div>

            <div className="flex gap-5 items-center">
              <p>Login</p>

              <Button>Sign-up</Button>
            </div>
          </div>
        </nav>

        <div className="hero__content text-center">
          <h2 className="hero__title">Sandy's Kitchenette</h2>

          <p className="hero__subtitle">
            From casual dining to unforgettable celebrations,
            <br />
            Sandy's Kitchenette offers delicious meals,
            <br />
            professional catering, and beautiful venue reservations.
          </p>

          {/* Optional Button */}
          {/* <Button className="mt-8">
            Reserve Now
          </Button> */}
        </div>

        <div className="hero__triangle" />
      </section>

      <div>asdfasdf</div>
    </>
  );
};

export default HomePage;
