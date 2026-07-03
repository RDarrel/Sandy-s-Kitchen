import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import bg1 from "../../assets/backgrounds/bg1.png";
import bg2 from "../../assets/backgrounds/bg2.png";
import bg3 from "../../assets/backgrounds/bg3.png";
import bg4 from "../../assets/backgrounds/bg4.png";

import logo from "../../assets/logos/kitchenette.jpg";
import "swiper/css";
import "./index.css";
import "swiper/css/effect-fade";
const HomePage = () => {
  const subtitleLines = [
    "Plan your next celebration with ease.",
    "Book catering appointments and reserve our venue",
    "for birthdays, weddings, meetings, and special gatherings.",
  ];

  return (
    <>
      <section className="hero">
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

        <nav className="navbar">
          <div className="navbar__content my-2">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Sandy's Kitchenette"
                className="navbar__logo"
              />

              <h1 className="navbar__title">Sandy's Kitchennete</h1>
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
          <h2 className="hero__title">
            Sandy's <span>Kitchenette</span>
          </h2>

          <p className="hero__subtitle">
            {subtitleLines.map((line) => (
              <span className="hero__subtitle-line" key={line}>
                {line}
              </span>
            ))}
          </p>

          {/* Optional Button */}
          <div className="gap-5 flex">
            <Button variant={"outline"} className="mt-8 text-black">
              Book Catering
            </Button>
            <Button className="bg-accent mt-8">Reserve Venue</Button>
          </div>
        </div>

        <div className="hero__triangle" />
      </section>

      <div>asdfasdf</div>
    </>
  );
};

export default HomePage;
