import { PackageCheck, Salad } from "lucide-react";
import Cluster from "./cluster";

const Step4 = ({
  form = {},
  mainCourses = [],
  sideMenus = [],
  setMainCourses = () => {},
  setSideMenus = () => {},
}) => {
  const targetPax = toNumber(
    form?.minimumPax || form?.minPax || form?.pax || form?.contact?.person,
  );

  return (
    <div className="space-y-5">
      <Cluster
        title="Main Courses"
        subtitle="Review selected main courses and set the guests served."
        icon={<PackageCheck className="size-5" />}
        menus={mainCourses}
        targetPax={targetPax}
        key={"cluster-1"}
      />
      <Cluster
        title="Side Menus"
        subtitle="Review selected side menus and set the guests served."
        icon={<Salad className="size-5" />}
        menus={sideMenus}
        targetPax={targetPax}
        key={"cluster-2"}
      />
    </div>
  );
};

export default Step4;
