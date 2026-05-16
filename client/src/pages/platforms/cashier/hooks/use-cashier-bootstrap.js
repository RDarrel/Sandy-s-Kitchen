import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FilterBY_AVAILABILITY } from "@/services/redux/slices/menu/menus";
import { BROWSE as BROWSE_CATEGORIES } from "@/services/redux/slices/menu/categories";
import {
  BROWSE_MENUS,
  HydrateCart,
  SetCartOpen,
} from "@/services/redux/slices/stations/cashier";
import { loadCashierCartFromStorage } from "@/services/redux/slices/stations/cashier.utils";

const useCashierBootstrap = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);
  const cart = useSelector(({ cashier }) => cashier?.cart);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousRestoration = window.history?.scrollRestoration;
    try {
      if (window.history) window.history.scrollRestoration = "manual";
    } catch {
      // ignore
    }

    const root = document.documentElement;
    const prevOverflowY = root.style.overflowY;
    const prevScrollbarGutter = root.style.scrollbarGutter;
    try {
      root.style.scrollbarGutter = "stable";
      root.style.overflowY = "scroll";
    } catch {
      // ignore
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    dispatch(HydrateCart(loadCashierCartFromStorage()));
    dispatch(SetCartOpen(false));

    return () => {
      try {
        if (window.history && previousRestoration)
          window.history.scrollRestoration = previousRestoration;
      } catch {
        // ignore
      }

      try {
        root.style.overflowY = prevOverflowY;
        root.style.scrollbarGutter = prevScrollbarGutter;
      } catch {
        // ignore
      }
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(FilterBY_AVAILABILITY("all"));
    if (token) {
      dispatch(BROWSE_MENUS({ token, params: { station: "cashier" } }));
      dispatch(BROWSE_CATEGORIES({ token }));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "cashierCart",
        JSON.stringify(cart || { version: 2, lines: [] }),
      );
    } catch {
      // ignore write errors
    }
  }, [cart]);
};

export default useCashierBootstrap;
