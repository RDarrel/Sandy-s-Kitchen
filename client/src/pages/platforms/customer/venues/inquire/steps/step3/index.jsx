import { MenuSelection } from "../menus";
import { Salad } from "lucide-react";
import Header from "../header";

const Step3 = ({
  selectedMainCount,
  selectedSideCount,
  packageInfo,
  menuSelections,
  handleMenuToggle = () => {},
}) => {
  console.log("menuSelections", menuSelections);
  console.log("packageInfo", packageInfo);
  return (
    <>
      <Header
        title="Side Menus"
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

        {/* <MenuSectionHeader
          icon={Salad}
          title="Side Menus"
          count={selectedSideCount}
          limit={packageInfo.sideMenuLimit}
        />

        <MenuSelection
          type="side"
          categories={packageInfo.sideMenuCategories}
          selections={menuSelections.side}
          onToggle={handleMenuToggle}
        /> */}
      </div>
    </>
  );
};

export default Step3;
