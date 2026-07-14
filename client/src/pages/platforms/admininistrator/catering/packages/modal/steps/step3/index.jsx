import { useSelector } from "react-redux";
import Menus from "../menus";

const Step3 = ({ mainCourses, setMainCourses = () => {} }) => {
  const { collections } = useSelector(({ menus }) => menus);
  return (
    <Menus
      selectedMenus={mainCourses}
      setSelectedMenus={setMainCourses}
      menus={collections}
    />
  );
};

export default Step3;
