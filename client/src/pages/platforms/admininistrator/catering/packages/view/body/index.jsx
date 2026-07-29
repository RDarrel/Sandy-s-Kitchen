import { cn } from "@/lib/utils";
import { Beef, Check, Gift, Salad } from "lucide-react";
import { useMemo } from "react";

const Body = ({ selected }) => {
  const {
    mainCourseCategories = [],
    sideMenuCategories = [],
    inclusions = [],
  } = selected;
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
      <FoodSelection
        categories={mainCourseCategories}
        title={"Main Courses"}
        Icon={Beef}
      />
      <FoodSelection
        categories={sideMenuCategories}
        title={"Side Menus"}
        Icon={Salad}
      />

      <div className="border border-primary/20 p-3 rounded-sm ">
        <h2 className="font-bold text-xl mb-2 flex gap-2">
          <Gift color="gray" /> Inclusions
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <Inclusions inclusions={services} title={"Services"} />
          <Inclusions inclusions={equipment} title={"Equipment"} />
        </div>
      </div>
    </div>
  );
};

export default Body;

const FoodSelection = ({ categories, title, Icon }) => {
  return (
    <div className="border border-primary/20 p-3 rounded-sm">
      <h2 className="font-bold text-xl mb-2 flex gap-2">
        <Icon color="gray" /> {title}
      </h2>
      <div className="grid grid-cols-3 gap-5 p-2">
        {categories.map((main, idx) => (
          <div
            key={idx}
            className={cn(
              "border-primary/20",
              (idx + 1) % 3 !== 0 && "border-r",
            )}
          >
            <span className="font-semibold text-lg">
              {main?.category?.name}
            </span>
            <ul className="list-disc list-inside">
              {main.choices.map((menu, cIdx) => (
                <li key={cIdx}>{menu?.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const Inclusions = ({ inclusions, title }) => {
  return (
    <div className=" gap-5">
      <div className="border-primary/20 border-r flex flex-col gap-2 ">
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
