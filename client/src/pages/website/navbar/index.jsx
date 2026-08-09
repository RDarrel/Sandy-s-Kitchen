import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/logos/kitchenette.jpg";
import "./style.css";

const navItems = [
  { label: "Home", to: "/" },
  // { label: "Dining", to: "/dining" },
  { label: "Catering", to: "/catering" },
  { label: "Venue", to: "/venue" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const isInnerPage = !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`navbar${isHomePage && isScrolled ? " navbar--scrolled" : ""}${
        isInnerPage ? " navbar--inner" : ""
      }${isMenuOpen ? " navbar--menu-open" : ""}`}
    >
      <div className="navbar__content">
        <button
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          className="navbar__menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        <div className="navbar__brand">
          <img src={logo} alt="Sandy's Kitchenette" className="navbar__logo" />

          <h1 className="navbar__title">
            <span>Sandy's</span>
            <small>Kitchenette</small>
          </h1>
        </div>

        <div className="navbar__links">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `navbar__link${isActive ? " navbar__link--active" : ""}`
              }
              end={item.to === "/"}
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar__actions">
          <NavLink to={"/authentication/sign-in"}>Login</NavLink>
          <Button onClick={() => navigate("/authentication/sign-up")}>
            Sign-up
          </Button>
        </div>

        <Button
          className="navbar__mobile-login"
          onClick={() => navigate("/authentication/sign-in")}
        >
          Login
        </Button>

        <div className="navbar__mobile-menu">
          <div className="navbar__mobile-links">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `navbar__mobile-link${
                    isActive ? " navbar__mobile-link--active" : ""
                  }`
                }
                end={item.to === "/"}
                key={item.to}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar__mobile-actions">
            <Button
              variant="outline"
              onClick={() => navigate("/authentication/sign-up")}
            >
              Sign-up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
