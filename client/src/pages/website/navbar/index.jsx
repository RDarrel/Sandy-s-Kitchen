import { Button } from "@/components/ui/button";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../../assets/logos/kitchenette.jpg";
import "./style.css";

const navItems = [
  { label: "Home", to: "/", description: "Discover Sandy's Kitchenette" },
  // { label: "Dining", to: "/dining" },
  { label: "Catering", to: "/catering", description: "Explore packages for your event" },
  { label: "Venue", to: "/venue", description: "Find a space for your celebration" },
  { label: "About Us", mobileLabel: "About Us", to: "/about", description: "Our story and where to find us" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const isInnerPage = !isHomePage;
  const navbarRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event) => {
      if (!navbarRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 860) setIsMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

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
      ref={navbarRef}
      className={`navbar${isHomePage && isScrolled ? " navbar--scrolled" : ""}${
        isInnerPage ? " navbar--inner" : ""
      }${isMenuOpen ? " navbar--menu-open" : ""}`}
    >
      <div className="navbar__content">
        <button
          ref={menuButtonRef}
          aria-controls="website-mobile-menu"
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

        <div
          id="website-mobile-menu"
          className="navbar__mobile-menu"
          inert={!isMenuOpen}
        >
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
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="navbar__mobile-link-copy">
                  <span>{item.mobileLabel || item.label}</span>
                  <small>{item.description}</small>
                </span>
                <ArrowUpRight aria-hidden="true" />
              </NavLink>
            ))}
          </div>

          <div className="navbar__mobile-actions">
            <p>New to Sandy&apos;s?</p>
            <Button
              className="navbar__mobile-signup"
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
