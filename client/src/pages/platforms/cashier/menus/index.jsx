import CashierBody from "./components/menus";
import CashierCart from "./components/cart";
import CashierCustomizeAddOnsDialog from "./components/customize-addons-dialog";
import useCashierBootstrap from "./hooks/use-cashier-bootstrap";
const Menus = () => {
  useCashierBootstrap();
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <CashierBody />
        <CashierCart />
      </div>
      <CashierCustomizeAddOnsDialog />
    </div>
  );
};

export default Menus;
