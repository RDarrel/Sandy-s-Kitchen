import { Beef } from "lucide-react";
import { MenuSelection } from "../../../../catering/inquire/steps/menus";
import Header from "../../../../catering/inquire/steps/header";

const Step2 = ({
  selectedMainCount,
  packageInfo,
  menuSelections,
  handleMenuToggle = () => {},
}) => {
  return (
    <>
      <Header
        title="Main Dishes"
        Icon={Beef}
        description="Choose the main courses you want to include in your package."
        badge={`${selectedMainCount}/${packageInfo.mainCourseLimit} selected`}
      />

      <div className="grid gap-4">
        <MenuSelection
          type="main"
          categories={packageInfo?.mainCourseCategories}
          selections={menuSelections.main}
          onToggle={handleMenuToggle}
        />
      </div>
    </>
  );
};

export default Step2;
