import CashierTopbar from "./components/topbar";
import CashierBody from "./components/menus";
import CashierCart from "./components/cart";
import CashierCustomizeAddOnsDialog from "./components/customize-addons-dialog";
import useCashierBootstrap from "./hooks/use-cashier-bootstrap";

const Cashier = () => {
  useCashierBootstrap();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CashierTopbar />

      <main
        className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 lg:px-6 lg:pb-6"
        style={{ paddingTop: "var(--cashier-topbar-height, 92px)" }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <CashierBody />
          <CashierCart />
        </div>
      </main>

      <CashierCustomizeAddOnsDialog />
    </div>
  );
};

export default Cashier;
