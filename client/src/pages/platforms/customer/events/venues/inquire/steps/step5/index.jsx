import { MenuSelection } from "../menus";
import { Salad } from "lucide-react";
import Header from "../header";

const Step3 = ({
  selectedSideCount,
  packageInfo,
  menuSelections,
  handleMenuToggle = () => {},
}) => {
  return (
    <>
      <Header
        title="Side Dishes"
        Icon={Salad}
        description="Select the side dishes to include in this catering package."
        badge={`${selectedSideCount}/${packageInfo.sideMenuLimit} selected`}
      />

      <div className="grid gap-4">
        <MenuSelection
          type="side"
          categories={packageInfo.sideMenuCategories}
          selections={menuSelections.side}
          onToggle={handleMenuToggle}
        />
      </div>
    </>
  );
};

export default Step3;
