import { Outlet } from "react-router-dom";
import Footer from "./footer";

const Website = () => {
  return (
    <>
      <div>Header</div>
      <Outlet />
      <Footer />
    </>
  );
};

export default Website;
