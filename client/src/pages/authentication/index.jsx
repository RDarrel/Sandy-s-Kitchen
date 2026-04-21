import { useEffect, useMemo, useState } from "react";
import Logo from "../../assets/logos/kitchenette.jpg";
import BG1 from "../../assets/backgrounds/bg1.png";
import BG2 from "../../assets/backgrounds/bg2.png";
import BG3 from "../../assets/backgrounds/bg3.png";
import BG4 from "../../assets/backgrounds/bg4.png";
import LoginForm from "./login";
import "./index.css";

const Authentication = () => {
  const slides = useMemo(
    () => [
      {
        src: BG1,
        kicker: "Sandy’s Kitchenette",
        title: "Freshly prepared meals",
        subtitle: "Mas masarap kapag bagong luto—perfect for dine-in and takeout.",
        features: ["Dine-in", "Takeout"],
      },
      {
        src: BG2,
        kicker: "We offer",
        title: "Catering for your events",
        subtitle: "Pang-birthday, meeting, or celebration—custom packages na swak sa budget.",
        features: ["Catering packages", "Custom menu"],
      },
      {
        src: BG3,
        kicker: "We offer",
        title: "Event venue reservations",
        subtitle: "Make your moments special—reserve a venue for gatherings and celebrations.",
        features: ["Venue rental", "Ideal for occasions"],
      },
      {
        src: BG4,
        kicker: "Good food, good moments",
        title: "Dine • Cater • Celebrate",
        subtitle: "Explore what Sandy’s Kitchenette offers while you log in—short, sweet, and helpful.",
        features: ["Food you’ll love", "Events made easy"],
      },
    ],
    []
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(Boolean(media.matches));
    apply();

    if (media.addEventListener) {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }

    media.addListener(apply);
    return () => media.removeListener(apply);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, [slides]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveSlide((idx) => (idx + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(id);
  }, [reduceMotion, slides.length]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-10 items-center justify-center text-primary-foreground rounded-full">
              <img src={Logo} alt="Sandy’s Kitchenette" className="h-10 w-10 rounded-full" />
            </div>
            Sandy&apos;s Kitchenette.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div
        className={[
          "auth-hero relative hidden bg-muted lg:block overflow-hidden",
          reduceMotion ? "reduce-motion" : "",
        ].join(" ")}
      >
        {slides.map((slide, idx) => (
          <div
            key={`${idx}-${slide.src}`}
            className={["auth-hero-slide", idx === activeSlide ? "is-active" : ""].join(" ")}
            aria-hidden={idx !== activeSlide}
          >
            <img
              src={slide.src}
              alt={slide.title}
              className="auth-hero-img h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              loading={idx === 0 ? "eager" : "lazy"}
            />

            <div className="auth-hero-overlay">
              <div className="auth-hero-card">
                <p className="auth-hero-kicker">{slide.kicker}</p>
                <h2 className="auth-hero-title">{slide.title}</h2>
                <p className="auth-hero-subtitle">{slide.subtitle}</p>
                <ul className="auth-hero-features">
                  {slide.features?.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Authentication;
