import CashierTopbar from "./menus/components/topbar";
import CashierBody from "./menus/components/menus";
import CashierCart from "./menus/components/cart";
import CashierCustomizeAddOnsDialog from "./menus/components/customize-addons-dialog";
import useCashierBootstrap from "./menus/hooks/use-cashier-bootstrap";
import { useSelector } from "react-redux";
import Sales from "./sales";
const Cashier = () => {
  const { activeTab } = useSelector(({ cashier }) => cashier);
  useCashierBootstrap();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CashierTopbar />

      <main
        className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 lg:px-6 lg:pb-6"
        style={{ paddingTop: "var(--cashier-topbar-height, 92px)" }}
      >
        {activeTab === "menus" ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <CashierBody />
            <CashierCart />
          </div>
        ) : (
          <div className="grid gap-4">
            <Sales />
          </div>
        )}
      </main>

      <CashierCustomizeAddOnsDialog />
    </div>
  );
};

export default Cashier;
