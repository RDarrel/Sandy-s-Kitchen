import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import "./style.css";

const Website = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div
      className={`website-layout${isHomePage ? "" : " website-layout--inner"}`}
    >
      <Navbar />
      <main className="website-layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Website;
