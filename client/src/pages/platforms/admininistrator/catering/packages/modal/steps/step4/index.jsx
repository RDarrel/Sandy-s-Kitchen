import { PackageCheck, Salad } from "lucide-react";
import Cluster from "./cluster";
import { useCallback } from "react";

const Step4 = ({
  form = {},
  mainCourses = [],
  sideMenus = [],
  setMainCourses = () => {},
  setSideMenus = () => {},
}) => {
  const targetPax = form.minimumGuests;

  const onUpdateCategoryLimit = useCallback(
    (isMainCourse = false, cId, limit) => {
      const setSource = isMainCourse ? setMainCourses : setSideMenus;
      setSource((prev) => {
        const source = [...prev];
        const pIdx = source.findIndex(({ category }) => category._id === cId);
        if (pIdx < 0) return;

        source[pIdx] = {
          ...source[pIdx],
          limit,
        };
        return source;
      });
    },
    [],
  );

  const onUpdateQtyServe = useCallback(
    (isMainCourse = false, cId, mId, qtyServe) => {
      const setSource = isMainCourse ? setMainCourses : setSideMenus;
      setSource((prev) => {
        const source = [...prev];
        const pIdx = source.findIndex(({ category }) => category._id === cId);
        if (pIdx < 0) return prev;
        const choices = [...source[pIdx].choices];
        const cIdx = choices.findIndex(({ menu }) => menu?._id === mId);

        if (cIdx < 0) return prev;
        choices[cIdx] = {
          ...choices[cIdx],
          prepQty: qtyServe,
        };

        source[pIdx] = {
          ...source[pIdx],
          choices,
        };
        return source;
      });
    },
    [],
  );

  return (
    <div className="space-y-5">
      <Cluster
        title="Main Courses"
        subtitle="Review selected main courses and set the guests served."
        icon={<PackageCheck className="size-5" />}
        menuCategories={mainCourses}
        targetPax={targetPax}
        onUpdateQtyServe={onUpdateQtyServe}
        onUpdateCategoryLimit={onUpdateCategoryLimit}
        key={"cluster-1"}
        isMainCourse
        emptyTitle="No main courses selected yet"
      />
      <Cluster
        title="Side Menus"
        subtitle="Review selected side menus and set the guests served."
        icon={<Salad className="size-5" />}
        menuCategories={sideMenus}
        targetPax={targetPax}
        key={"cluster-2"}
        onUpdateQtyServe={onUpdateQtyServe}
        onUpdateCategoryLimit={onUpdateCategoryLimit}
        emptyTitle="No side menus selected yet"
      />
    </div>
  );
};

export default Step4;
