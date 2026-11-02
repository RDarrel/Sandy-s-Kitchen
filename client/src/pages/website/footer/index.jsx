import { Link } from "react-router-dom";
import { legalDocuments } from "../legal/documents";
import logo from "../../../assets/logos/kitchenette.jpg";
import "./style.css";

const Footer = () => {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Catering", to: "/catering" },
    { label: "Venue", to: "/venue" },
    { label: "About", to: "/about" },
  ];
  const socialLinks = ["Facebook", "Instagram"];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__company footer__group">
          <h3>Company</h3>
          <img src={logo} alt="Sandy's Kitchenette" className="footer__logo" />
          <div className="footer__group">
            <p>Sandy's Kitchenette</p>
            <p>Comfort food, catering, and venue reservations</p>
            <p>Book your next celebration with us</p>
          </div>
        </div>

        <div className="footer__links">
          <nav className="footer__group" aria-labelledby="footer-quick-links">
            <h3 id="footer-quick-links">Quick Links</h3>
            {quickLinks.map(({ label, to }) => (
              <Link to={to} key={to}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="footer__resources">
            <div className="footer__group">
              <h3>Legal</h3>
              {Object.values(legalDocuments).map(({ title, path }) => (
                <Link to={path} key={path}>
                  {title}
                </Link>
              ))}
            </div>

            <div className="footer__group">
              <h3>Socials</h3>
              {socialLinks.map((link) => (
                <a href="#footer" key={link}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__map" aria-label="Sandy's Kitchenette map">
          <iframe
            title="Sandy's Kitchenette location"
            src="https://www.google.com/maps?q=15.3529211,121.0649348&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 Sandy's Kitchenette | All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
