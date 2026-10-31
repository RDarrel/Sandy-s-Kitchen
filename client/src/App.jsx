import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect, useLayoutEffect, useRef } from "react";
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
import Payment from "./pages/platforms/customer/myBookings/payment";
import BookingDetails from "./pages/platforms/customer/myBookings/details";
import CateringInquiry from "./pages/platforms/customer/events/catering/inquire";
import CateringDetails from "./pages/platforms/customer/events/catering/details";
import VenueInquiry from "./pages/platforms/customer/events/venues/inquire";
import VenueDetails from "./pages/platforms/customer/events/venues/details";
import BookingCoordinator from "./pages/platforms/booking_coordinator";

export default function App() {
  const { auth, isCheckingAuth } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);

  useLayoutEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      const action = await dispatch(VALIDATEREFRESH());
      if (active && action?.payload?.requiresSignIn) {
        navigateRef.current("/authentication/sign-in", { replace: true });
      }
    };
    checkSession();
    return () => { active = false; };
  }, [dispatch]);

  useLayoutEffect(() => {
    const loader = document.getElementById("startup-loader");
    const root = document.getElementById("root");

    if (loader) loader.hidden = !isCheckingAuth;
    if (root) root.hidden = isCheckingAuth;
  }, [isCheckingAuth]);

  if (isCheckingAuth) return null;

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
        {RouteConfig(auth)}
        <Route
          path="/platforms/catering/inquire"
          element={<CateringInquiry />}
        />
        <Route
          path="/platforms/catering/details"
          element={<CateringDetails />}
        />
        <Route path="/platforms/venues/inquire" element={<VenueInquiry />} />
        <Route path="/platforms/venues/details" element={<VenueDetails />} />
        <Route
          path="/platforms/my-bookings/:reference"
          element={<BookingDetails />}
        />
        <Route
          path="/platforms/my-bookings/:reference/payment"
          element={<Payment />}
        />

        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="cashier" element={<Cashier />} />
      <Route path="coordinator" element={<BookingCoordinator />} />
      <Route path="receipts/order" element={<OrderReceipt />} />
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
