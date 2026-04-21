import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import "./App.css";
import Platforms from "./pages/platforms";
import RouteConfig from "./pages/RouteConfig";
import { useDispatch, useSelector } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect } from "react";
import Cashier from "./pages/platforms/cashier";
import ClaimStub from "./components/shared/claimStub";
import Authentication from "./pages/authentication";
import Arduino from "./pages/arduino";
export default function App() {
  const { auth, token } = useSelector(({ auth }) => auth),
    dispatch = useDispatch();
  useEffect(() => {
    if (!auth?._id && token) {
      dispatch(VALIDATEREFRESH(token));
    }
  }, [token, auth]);
  return (
    <Routes>
      <Route path="/" element={<Authentication />} />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig()}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="arduino" element={<Arduino />} />
      <Route path="cashier" element={<Cashier />} />
      <Route path="printout/claimStub" element={<ClaimStub />} />
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
