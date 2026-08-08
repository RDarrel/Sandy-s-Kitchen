import { Check, Gift } from "lucide-react";
import { useMemo } from "react";

const Body = ({ selected }) => {
  const { inclusions = [] } = selected;
  const { services = [], equipment = [] } = useMemo(() => {
    if (inclusions.length === 0) return {};
    const getByModule = (module) =>
      inclusions.filter(({ model }) => model === module);
    return {
      services: getByModule("Services"),
      equipment: getByModule("Equipment"),
    };
  }, [inclusions]);

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-primary/20 p-3 rounded-sm ">
        <h2 className="font-bold text-xl mb-2 flex gap-2">
          <Gift color="gray" /> Inclusions
        </h2>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-5">
          <Inclusions inclusions={services} title={"Services"} />
          <div className="border-primary/20 border-r" />
          <Inclusions inclusions={equipment} title={"Equipment"} />
        </div>
      </div>
    </div>
  );
};

export default Body;

const Inclusions = ({ inclusions, title }) => {
  return (
    <div className=" gap-5">
      <div className=" flex flex-col gap-2 ">
        <h2 className="font-bold">{title}</h2>
        <div className="flex flex-col gap-2">
          {inclusions.map(({ item, unit = null, amount }, idx) => (
            <div className="flex gap-2" key={idx}>
              <span className="inline-flex items-center justify-center bg-accent/15 p-1 rounded-sm">
                <Check className="text-accent " size={10} />
              </span>
              <span>
                {item?.name}{" "}
                {unit &&
                  `(${amount}${unit === "hrs" ? (amount > 2 ? " hrs" : " hr") : ""})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
