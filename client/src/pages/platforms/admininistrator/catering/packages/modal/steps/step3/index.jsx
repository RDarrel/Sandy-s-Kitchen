import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step3 = ({ mainCourses = [], sideMenus, setSideMenus = () => {} }) => {
  const { collections } = useSelector(({ menus }) => menus);
  const availableSideMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) => !mainCourses.some((main) => main._id === _id),
    );
  }, [mainCourses]);
  return (
    <Menus
      menus={availableSideMenus}
      selectedMenus={sideMenus}
      setSelectedMenus={setSideMenus}
      availableSubtitle="Choose your preferred side menus."
      selectedSubtitle="Review your selected side menus."
    />
  );
};

export default Step3;
