import CashierTopbar from "./menus/components/topbar";
import { BROWSE as BROWSE_CATEGORIES } from "@/services/redux/slices/menu/categories";
import {
  BROWSE_MENUS,
  BROWSE_SALES,
} from "@/services/redux/slices/stations/cashier";
import { useSelector, useDispatch } from "react-redux";
import Sales from "./sales";
import Menus from "./menus";
import { useEffect } from "react";
const Cashier = () => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { activeTab } = useSelector(({ cashier }) => cashier);
  const dispatch = useDispatch();
  useEffect(() => {
    if (token) {
      dispatch(BROWSE_MENUS({ token, params: { station: "cashier" } }));
      dispatch(BROWSE_SALES({ token, params: { cashier: auth?._id } }));
      dispatch(BROWSE_CATEGORIES({ token }));
    }
  }, [token, auth, dispatch]);
  console.log("activeTab", activeTab);
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CashierTopbar />

      <main
        className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 lg:px-6 lg:pb-6"
        style={{ paddingTop: "var(--cashier-topbar-height, 92px)" }}
      >
        {activeTab === "menus" ? (
          <Menus />
        ) : (
          <div className="grid gap-4">
            <Sales />
          </div>
        )}
      </main>
    </div>
  );
};

export default Cashier;
