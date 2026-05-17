import CashierTopbar from "./menus/components/topbar";
import { BROWSE as BROWSE_CATEGORIES } from "@/services/redux/slices/menu/categories";
import {
  BROWSE_MENUS,
  BROWSE_SALES,
  SetActiveCategory,
} from "@/services/redux/slices/stations/cashier";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sales from "./sales";
import Menus from "./menus";
const Cashier = () => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { activeTab, categories = [] } = useSelector(({ cashier }) => cashier);
  const dispatch = useDispatch();
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    if (token) {
      dispatch(BROWSE_MENUS({ token, params: { station: "cashier" } }));
      dispatch(BROWSE_SALES({ token, params: { cashier: auth?._id } }));
      dispatch(BROWSE_CATEGORIES({ token }));
    }
  }, [token, auth, dispatch]);

  useEffect(() => {
    const prev = String(prevTabRef.current || "");
    const next = String(activeTab || "");
    prevTabRef.current = next;

    if (prev === "menus" || next !== "menus") return;

    const firstCategoryId = String(categories?.[0]?._id || "");
    if (!firstCategoryId) return;

    try {
      window.__cashierDisableScrollSpy = true;
      window.__cashierCategoryScrollTarget = firstCategoryId;
      window.__cashierCategoryScrollTargetExpiresAt = Date.now() + 1500;
      window.__cashierCategoryScrollTargetSetAt = Date.now();
    } catch {
      // ignore
    }

    dispatch(SetActiveCategory(firstCategoryId));
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      try {
        window.__cashierDisableScrollSpy = false;
        window.__cashierCategoryScrollTarget = "";
        window.__cashierCategoryScrollTargetExpiresAt = 0;
        window.__cashierCategoryScrollTargetSetAt = 0;
      } catch {
        // ignore
      }
    }, 250);
  }, [activeTab, categories, dispatch]);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CashierTopbar />

      <main
        className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 lg:px-6 lg:pb-6"
        style={{ paddingTop: "var(--cashier-topbar-height, 92px)" }}
      >
        <div className={activeTab === "menus" ? "block" : "hidden"}>
          <Menus />
        </div>
        <div className={activeTab === "sales" ? "block" : "hidden"}>
          <div className="grid gap-4">
            <Sales />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cashier;
