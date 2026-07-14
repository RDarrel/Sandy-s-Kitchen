import Menus from "../menus";

const Step2 = ({ mainCourses, setMainCourses = () => {} }) => {
  return (
    <Menus selectedMenus={mainCourses} setSelectedMenus={setMainCourses} />
  );
};

export default Step2;
