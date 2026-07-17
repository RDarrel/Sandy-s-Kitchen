import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step3 = ({
  mainCourses = [],
  sideMenus,
  sideMenuLimit = "",
  setSideMenus = () => {},
  setSideMenuLimit = () => {},
}) => {
  const { collections } = useSelector(({ menus }) => menus);
  const availableSideMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) => !mainCourses.some((main) => main._id === _id),
    );
  }, [collections, mainCourses]);
  return (
    <Menus
      menus={availableSideMenus}
      selectedMenus={sideMenus}
      setSelectedMenus={setSideMenus}
      availableSubtitle="Choose your preferred side menus."
      selectedSubtitle="Review your selected side menus."
      selectionLimitLabel="Side menu limit"
      selectionLimitItemLabel="side menus"
      selectionLimitValue={sideMenuLimit}
      setSelectionLimitValue={setSideMenuLimit}
    />
  );
};

export default Step3;
