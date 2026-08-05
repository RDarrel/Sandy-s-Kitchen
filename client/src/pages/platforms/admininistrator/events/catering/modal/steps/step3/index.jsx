import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step3 = ({ form = {}, setForm = () => {} }) => {
  const { mainCourses, sideMenus } = form;
  const { collections } = useSelector(({ menus }) => menus);
  const availableSideMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) =>
        !mainCourses.some(({ choices }) =>
          choices.some(({ menu }) => menu?._id === _id),
        ),
    );
  }, [collections, mainCourses]);

  return (
    <Menus
      availableSubtitle="Choose your preferred side menus."
      selectedSubtitle="Review your selected side menus."
      selectionLimitLabel="Side menu limit"
      selectionLimitItemLabel="side menus"
      menus={availableSideMenus}
      menuCategories={sideMenus}
      setForm={setForm}
    />
  );
};

export default Step3;
