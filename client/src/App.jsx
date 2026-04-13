import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import "./App.css";
import Platforms from "./pages/platforms";
import RouteConfig from "./pages/RouteConfig";
import { useDispatch, useSelector } from "react-redux";
import { VALIDATEREFRESH } from "./services/redux/slices/persons/auth";
import { useEffect } from "react";
import Cashier from "./pages/platforms/cashier/dashboard";
import ClaimStub from "./components/shared/claimStub";
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
      <Route path="/" element={<Home />} />
      {/* <Route path="/authentication/:action" element={<Authentication />} /> */}
      <Route path="/platforms" element={<Platforms />}>
        {RouteConfig()}
        <Route path="*" element={<h2>Not Found</h2>} />
      </Route>
      <Route path="cashier" element={<Cashier />} />
      <Route path="printout/claimStub" element={<ClaimStub />} />
      <Route path="*" element={<h2>Not Found</h2>} />
    </Routes>
  );
}
