import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step2 = ({
  sideMenus,
  mainCourses,
  mainCourseLimit = 0,
  setMainCourses = () => {},
  setMainCourseLimit = () => {},
}) => {
  const { collections } = useSelector(({ menus }) => menus);
  const availableMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) => !sideMenus.some((menu) => menu?._id === _id),
    );
  }, [collections, sideMenus]);
  return (
    <Menus
      isMainCourse
      selectedMenus={mainCourses}
      setSelectedMenus={setMainCourses}
      menus={availableMenus}
      availableSubtitle="Choose your preferred main courses."
      selectedSubtitle="Review your selected main courses."
      selectionLimitLabel="Main course limit"
      selectionLimitItemLabel="main courses"
      selectionLimitValue={mainCourseLimit}
      setSelectionLimitValue={setMainCourseLimit}
    />
  );
};

export default Step2;
