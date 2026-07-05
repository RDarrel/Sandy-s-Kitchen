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
      <path
        className="home-divider__curve"
        d="M0 24C190 17 296 31 432 24C568 17 640 18 720 24C812 31 914 31 1040 24C1182 16 1284 18 1440 24"
      />
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
