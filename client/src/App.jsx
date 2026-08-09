import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect } from "react";
import { OrderReceipt } from "./components/shared/receipts";
import HomePage from "./pages/website/home";
import About from "./pages/website/about";
import Platforms from "./pages/platforms";
import RouteConfig from "./pages/RouteConfig";
import Cashier from "./pages/platforms/cashier";
import Authentication from "./pages/authentication";
import Website from "./pages/website";
import Dining from "./pages/website/dining";
import Catering from "./pages/website/catering";
import Venue from "./pages/website/venue";
import Login from "./pages/authentication/login";
import SignUp from "./pages/authentication/sign-up";
import "./App.css";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(VALIDATEREFRESH());
  }, [dispatch]);
  return (
    <Routes>
      <Route element={<Website />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/catering" element={<Catering />} />
        <Route path="/venue" element={<Venue />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="authentication" element={<Authentication />}>
        <Route path="sign-in" element={<Login />} />
        <Route path="sign-up" element={<SignUp />} />
      </Route>
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig()}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="cashier" element={<Cashier />} />
      <Route path="receipts/order" element={<OrderReceipt />} />
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
