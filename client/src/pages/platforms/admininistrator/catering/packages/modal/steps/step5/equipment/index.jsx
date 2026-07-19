import Cluster from "./cluster";
import Seperator from "./seperator";

const Equipment = () => {
  return (
    <div className="max-h-[30rem] overflow-hidden rounded-[7px] border border-border bg-card">
      <div className="grid gap-4 p-4 xl:grid-cols-[1fr_24px_1fr] xl:items-stretch">
        <Cluster />
        <Seperator />
        <Cluster />
      </div>
    </div>
  );
};

export default Equipment;
