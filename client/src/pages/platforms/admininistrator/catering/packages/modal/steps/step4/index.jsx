import { PackageCheck, Salad } from "lucide-react";
import Cluster from "./cluster";
import { useCallback } from "react";

const Step4 = ({
  form = {},
  setForm = () => {},
  setMainCourses = () => {},
  setSideMenus = () => {},
}) => {
  const { mainCourses, sideMenus, minimumGuests } = form;

  const onUpdateCategoryLimit = useCallback(
    (isMainCourse = false, cId, limit) => {
      const clusterKey = isMainCourse ? "mainCourses" : "sideMenus";
      setForm((prev) => {
        const menus = [...prev[clusterKey]];
        const pIdx = menus.findIndex(({ category }) => category._id === cId);
        if (pIdx < 0) return;

        menus[pIdx] = {
          ...menus[pIdx],
          limit,
        };
        return { ...prev, [clusterKey]: menus };
      });
    },
    [],
  );

  const onUpdateQtyServe = useCallback(
    (isMainCourse = false, cId, mId, qtyServe) => {
      const clusterKey = isMainCourse ? "mainCourses" : "sideMenus";

      setForm((prev) => {
        const menus = [...prev[clusterKey]];
        const pIdx = menus.findIndex(({ category }) => category._id === cId);
        if (pIdx < 0) return prev;
        const choices = [...menus[pIdx].choices];
        const cIdx = choices.findIndex(({ menu }) => menu?._id === mId);

        if (cIdx < 0) return prev;
        choices[cIdx] = {
          ...choices[cIdx],
          prepQty: qtyServe,
        };

        menus[pIdx] = {
          ...menus[pIdx],
          choices,
        };
        return { ...prev, [clusterKey]: menus };
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
        targetPax={minimumGuests}
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
        targetPax={minimumGuests}
        key={"cluster-2"}
        onUpdateQtyServe={onUpdateQtyServe}
        onUpdateCategoryLimit={onUpdateCategoryLimit}
        emptyTitle="No side menus selected yet"
      />
    </div>
  );
};

export default Step4;
