import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step2 = ({ sideMenus, mainCourses, setMainCourses = () => {} }) => {
  const { collections } = useSelector(({ menus }) => menus);
  const availableMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) => !sideMenus.some((menu) => menu?._id === _id),
    );
  }, [collections]);
  return (
    <Menus
      selectedMenus={mainCourses}
      setSelectedMenus={setMainCourses}
      menus={availableMenus}
      availableSubtitle="Choose your preferred main courses."
      selectedSubtitle="Review your selected main courses."
    />
  );
};

export default Step2;
