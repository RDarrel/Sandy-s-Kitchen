import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className={`navbar${isScrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar__content  my-2">
        <div className="navbar__brand flex items-center gap-3">
          <img src={logo} alt="Sandy's Kitchenette" className="navbar__logo" />

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
  );
};

export default Navbar;
