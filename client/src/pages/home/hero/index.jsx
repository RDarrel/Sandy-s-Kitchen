import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarCheck, MapPin } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import bg1 from "../../../assets/backgrounds/bg1.png";
import bg2 from "../../../assets/backgrounds/bg2.png";
import bg3 from "../../../assets/backgrounds/bg3.png";
import bg4 from "../../../assets/backgrounds/bg4.png";

import logo from "../../../assets/logos/kitchenette.jpg";
import "swiper/css";
import "./style.css";
import "swiper/css/effect-fade";
const Hero = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const subtitleLines = [
    "Plan your next celebration with ease.",
    "Book catering appointments and reserve our venue",
    "for birthdays, weddings, meetings, and special gatherings.",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className="hero" id="top">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          loop={true}
          speed={1200}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="hero__swiper"
        >
          <SwiperSlide>
            <img src={bg1} />
          </SwiperSlide>

          <SwiperSlide>
            <img src={bg2} />
          </SwiperSlide>

          <SwiperSlide>
            <img src={bg3} />
          </SwiperSlide>

          <SwiperSlide>
            <img src={bg4} />
          </SwiperSlide>
        </Swiper>

        <div className="hero__overlay" />

        <nav className={`navbar${isScrolled ? " navbar--scrolled" : ""}`}>
          <div className="navbar__content  my-2">
            <div className="navbar__brand flex items-center gap-3">
              <img
                src={logo}
                alt="Sandy's Kitchenette"
                className="navbar__logo"
              />

              <h1 className="navbar__title">
                <span>Sandy's</span>
                <small>Kitchenette</small>
              </h1>
            </div>

            <div className="navbar__links">
              <a
                href="#top"
                className="navbar__link navbar__link--active"
                aria-current="page"
              >
                Home
              </a>
              <a href="#offers" className="navbar__link">
                Dining
              </a>
              <a href="#offers" className="navbar__link">
                Catering
              </a>
              <a href="#offers" className="navbar__link">
                Venue
              </a>
              <a href="#about" className="navbar__link">
                About
              </a>
            </div>

            <div className="flex gap-5 items-center">
              <p>Login</p>

              <Button>Sign-up</Button>
            </div>
          </div>
        </nav>

        <div className="hero__content text-center">
          <h2 className="hero__title">
            <span className="hero__title-word">
              <span className="hero__title-accent">S</span>andy's
            </span>{" "}
            <span className="hero__title-word">
              <span className="hero__title-accent">K</span>itchenette
            </span>
          </h2>

          <p className="hero__subtitle">
            {subtitleLines.map((line) => (
              <span className="hero__subtitle-line" key={line}>
                {line}
              </span>
            ))}
          </p>

          <div className="hero__actions">
            <Button className="hero__action hero__action--catering">
              <CalendarCheck />
              Book Catering
            </Button>
            <Button className="hero__action hero__action--venue">
              <MapPin />
              Reserve Venue
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
