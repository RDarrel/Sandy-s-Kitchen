import { Routes, Route } from "react-router-dom";
import "./App.css";
import Platforms from "./pages/platforms";
import RouteConfig from "./pages/RouteConfig";
import { useDispatch } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect } from "react";
import Cashier from "./pages/platforms/cashier";
import Authentication from "./pages/authentication";
import { OrderReceipt } from "./components/shared/receipts";
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(VALIDATEREFRESH());
  }, [dispatch]);
  return (
    <Routes>
      <Route path="/" element={<Authentication />} />
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
