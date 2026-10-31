import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ auth: {}, isCheckingAuth: true }));
const dispatch = vi.hoisted(() => vi.fn());

vi.mock("react-redux", () => ({
  useSelector: (selector) => selector({ auth: authState }),
  useDispatch: () => dispatch,
}));
vi.mock("./services/redux/slices/persons/auth", () => ({
  VALIDATEREFRESH: () => ({ type: "validate-session" }),
}));

// Keep this test focused on startup visibility rather than page dependencies.
for (const path of [
  "./components/shared/receipts",
  "./pages/website/home",
  "./pages/website/about",
  "./pages/platforms",
  "./pages/RouteConfig",
  "./pages/platforms/cashier",
  "./pages/authentication",
  "./pages/website",
  "./pages/website/dining",
  "./pages/website/catering",
  "./pages/website/venue",
  "./pages/authentication/login",
  "./pages/authentication/sign-up",
  "./pages/platforms/customer/myBookings/payment",
  "./pages/platforms/customer/myBookings/details",
  "./pages/platforms/customer/events/catering/inquire",
  "./pages/platforms/customer/events/catering/details",
  "./pages/platforms/customer/events/venues/inquire",
  "./pages/platforms/customer/events/venues/details",
  "./pages/platforms/booking_coordinator",
]) {
  vi.doMock(path, () => ({ default: () => null, OrderReceipt: () => null }));
}

const { default: App } = await import("./App");

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  authState.isCheckingAuth = true;
  dispatch.mockClear();
});

it("keeps the HTML loader until auth settles and reveals the committed app", () => {
  document.body.innerHTML = '<main id="startup-loader"></main><div id="root" hidden></div>';
  const loader = document.getElementById("startup-loader");
  const root = document.getElementById("root");
  const tree = () => (
    <StrictMode>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </StrictMode>
  );
  const { rerender } = render(tree(), { container: root });

  expect(loader.hidden).toBe(false);
  expect(root.hidden).toBe(true);
  expect(dispatch).toHaveBeenCalledWith({ type: "validate-session" });

  // Both successful and rejected auth checks clear isCheckingAuth.
  authState.isCheckingAuth = false;
  rerender(tree());
  expect(loader.hidden).toBe(true);
  expect(root.hidden).toBe(false);

  authState.isCheckingAuth = true;
  rerender(tree());
  expect(loader.hidden).toBe(false);
  expect(root.hidden).toBe(true);
});
