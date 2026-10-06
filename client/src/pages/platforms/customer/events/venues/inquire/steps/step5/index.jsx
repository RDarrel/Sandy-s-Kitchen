import { Salad } from "lucide-react";
import { MenuSelection } from "../../../../catering/inquire/steps/menus";
import Header from "../../../../catering/inquire/steps/header";
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
