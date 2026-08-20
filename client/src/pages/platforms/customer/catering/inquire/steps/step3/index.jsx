import { MenuSectionHeader, MenuSelection } from "../menus";
import { Beef, Utensils } from "lucide-react";
import Header from "../header";

const Step3 = ({
  selectedMainCount,
  selectedSideCount,
  packageInfo,
  menuSelections,
  handleMenuToggle = () => {},
}) => {
  console.log("running step3");
  return (
    <>
      <Header
        title="Menu Choices"
        Icon={Beef}
        description="Choose the food lineup included in this catering package."
        badge={`${selectedMainCount + selectedSideCount}/${
          packageInfo.mainCourseLimit + packageInfo.sideMenuLimit
        } selected`}
      />

      <div className="grid gap-4">
        <MenuSectionHeader
          icon={Utensils}
          title="Main Courses"
          count={selectedMainCount}
          limit={packageInfo.mainCourseLimit}
        />

        <MenuSelection
          type="main"
          categories={packageInfo.mainCourseCategories}
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

export default Step3;
