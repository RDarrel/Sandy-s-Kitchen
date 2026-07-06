import logo from "../../../assets/logos/kitchenette.jpg";
import "./style.css";

const Footer = () => {
  const legalLinks = [
    "Terms and conditions",
    "Privacy & Cookie policy",
    "Reservation agreement",
  ];

  const socialLinks = ["Facebook", "Instagram"];

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__company">
          <img
            src={logo}
            alt="Sandy's Kitchenette"
            className="footer__logo"
          />

          <div className="footer__group">
            <h3>Company</h3>
            <p>Sandy's Kitchenette</p>
            <p>Comfort food, catering, and venue reservations</p>
            <p>Book your next celebration with us</p>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__group">
            <h3>Legal</h3>
            {legalLinks.map((link) => (
              <a href="#footer" key={link}>
                {link}
              </a>
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

        <div className="footer__map" aria-label="Sandy's Kitchenette map">
          <iframe
            title="Sandy's Kitchenette location"
            src="https://www.google.com/maps?q=Sandy%27s%20Kitchenette&output=embed"
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
