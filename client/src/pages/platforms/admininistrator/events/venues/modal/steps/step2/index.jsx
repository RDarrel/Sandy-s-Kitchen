import { useSelector } from "react-redux";
import Menus from "../menus";
import { useMemo } from "react";

const Step2 = ({ form, setForm = () => {} }) => {
  const { mainCourseLimit, mainCourses = [], sideMenus = [] } = form;
  const { collections } = useSelector(({ menus }) => menus);
  const availableMenus = useMemo(() => {
    return collections.filter(
      ({ _id }) =>
        !sideMenus.some(({ choices }) =>
          choices.some(({ menu }) => menu?._id === _id),
        ),
    );
  }, [collections, sideMenus]);

  return (
    <Menus
      availableSubtitle="Choose your preferred main courses."
      selectedSubtitle="Review your selected main courses."
      selectionLimitLabel="Main course limit"
      selectionLimitItemLabel="main courses"
      isMainCourse
      menuCategories={mainCourses}
      menus={availableMenus}
      selectionLimitValue={mainCourseLimit}
      setForm={setForm}
    />
  );
};

export default Step2;
