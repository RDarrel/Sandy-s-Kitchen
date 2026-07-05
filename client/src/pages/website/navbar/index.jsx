import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../../assets/logos/kitchenette.jpg";
import "./style.css";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Dining", to: "/dining" },
  { label: "Catering", to: "/catering" },
  { label: "Venue", to: "/venue" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const isSolid = !isHomePage || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav className={`navbar${isSolid ? " navbar--scrolled" : ""}`}>
      <div className="navbar__content  my-2">
        <div className="navbar__brand flex items-center gap-3">
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

        <div className="flex gap-5 items-center">
          <p>Login</p>

          <Button>Sign-up</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
