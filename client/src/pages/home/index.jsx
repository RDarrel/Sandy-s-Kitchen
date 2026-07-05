import About from "./about";
import Hero from "./hero";
import Offers from "./offers";
import Footer from "./footer";
import WhyChoose from "./whyChoose";
import Moments from "./moments";
import FAQs from "./FAQs";
import "./style.css";

const SectionDivider = () => (
  <div className="home-divider" aria-hidden="true">
    <svg
      className="home-divider__wave"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      focusable="false"
    >
      <g className="home-divider__path-set home-divider__path-set--desktop">
        <path
          className="home-divider__curve"
          d="M0 21C92 15 168 27 258 21C356 14 430 28 526 21C616 15 670 22 704 24"
        />
        <path
          className="home-divider__curve home-divider__curve--soft"
          d="M0 29C92 35 168 23 258 29C356 36 430 22 526 29C616 35 670 28 704 26"
        />
        <path
          className="home-divider__curve"
          d="M736 24C770 22 824 15 914 21C1010 28 1084 14 1182 21C1272 27 1348 15 1440 21"
        />
        <path
          className="home-divider__curve home-divider__curve--soft"
          d="M736 26C770 28 824 35 914 29C1010 22 1084 36 1182 29C1272 23 1348 35 1440 29"
        />
        <path
          className="home-divider__spark home-divider__spark--left home-divider__spark--top"
          pathLength="1"
          d="M704 24C670 22 616 15 526 21C430 28 356 14 258 21C168 27 92 15 0 21"
        />
        <path
          className="home-divider__spark home-divider__spark--left home-divider__spark--bottom"
          pathLength="1"
          d="M704 26C670 28 616 35 526 29C430 22 356 36 258 29C168 23 92 35 0 29"
        />
        <path
          className="home-divider__spark home-divider__spark--right home-divider__spark--top"
          pathLength="1"
          d="M736 24C770 22 824 15 914 21C1010 28 1084 14 1182 21C1272 27 1348 15 1440 21"
        />
        <path
          className="home-divider__spark home-divider__spark--right home-divider__spark--bottom"
          pathLength="1"
          d="M736 26C770 28 824 35 914 29C1010 22 1084 36 1182 29C1272 23 1348 35 1440 29"
        />
      </g>
      <g className="home-divider__path-set home-divider__path-set--mobile">
        <path
          className="home-divider__curve"
          d="M0 21C92 15 168 27 258 21C356 14 430 28 526 21C610 15 638 22 660 24"
        />
        <path
          className="home-divider__curve home-divider__curve--soft"
          d="M0 29C92 35 168 23 258 29C356 36 430 22 526 29C610 35 638 28 660 26"
        />
        <path
          className="home-divider__curve"
          d="M780 24C802 22 830 15 914 21C1010 28 1084 14 1182 21C1272 27 1348 15 1440 21"
        />
        <path
          className="home-divider__curve home-divider__curve--soft"
          d="M780 26C802 28 830 35 914 29C1010 22 1084 36 1182 29C1272 23 1348 35 1440 29"
        />
        <path
          className="home-divider__spark home-divider__spark--left home-divider__spark--top"
          pathLength="1"
          d="M660 24C638 22 610 15 526 21C430 28 356 14 258 21C168 27 92 15 0 21"
        />
        <path
          className="home-divider__spark home-divider__spark--left home-divider__spark--bottom"
          pathLength="1"
          d="M660 26C638 28 610 35 526 29C430 22 356 36 258 29C168 23 92 35 0 29"
        />
        <path
          className="home-divider__spark home-divider__spark--right home-divider__spark--top"
          pathLength="1"
          d="M780 24C802 22 830 15 914 21C1010 28 1084 14 1182 21C1272 27 1348 15 1440 21"
        />
        <path
          className="home-divider__spark home-divider__spark--right home-divider__spark--bottom"
          pathLength="1"
          d="M780 26C802 28 830 35 914 29C1010 22 1084 36 1182 29C1272 23 1348 35 1440 29"
        />
      </g>
    </svg>
    <div className="home-divider__ornament">
      <span />
      <span />
      <span />
    </div>
  </div>
);

const HomePage = () => {
  return (
    <main className="home-page">
      <Hero />
      <About />
      <SectionDivider />
      <Offers />
      <SectionDivider />
      <WhyChoose />
      <SectionDivider />
      <FAQs />
      <SectionDivider />
      <Moments />
      <Footer />
    </main>
  );
};

export default HomePage;
