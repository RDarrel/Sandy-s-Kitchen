import { MenuSelection } from "../menus";
import { Beef } from "lucide-react";
import Header from "../header";

const Step2 = ({
  selectedMainCount,
  selectedSideCount,
  packageInfo,
  menuSelections,
  handleMenuToggle = () => {},
}) => {
  return (
    <>
      <Header
        title="Main Courses"
        Icon={Beef}
        description="Choose the main courses you want to include in your package."
        badge={`${selectedMainCount + selectedSideCount}/${
          packageInfo.mainCourseLimit + packageInfo.sideMenuLimit
        } selected`}
      />

      <div className="grid gap-4">
        <MenuSelection
          type="main"
          categories={packageInfo?.mainCourseCategories}
          selections={menuSelections.main}
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

export default Step2;
