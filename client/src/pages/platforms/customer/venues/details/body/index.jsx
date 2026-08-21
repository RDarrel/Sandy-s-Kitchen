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

  const sideMenuLimit = sideMenuCategories?.reduce(
    (acc, curr) => (acc += curr?.limit),
    0,
  );

  return (
    <div className="flex flex-col gap-2">
      <FoodSelection
        categories={mainCourseCategories}
        max={selected?.mainCourseLimit}
        title={"Main Courses"}
        Icon={Beef}
      />
      <FoodSelection
        categories={sideMenuCategories}
        title={"Side Menus"}
        max={sideMenuLimit}
        Icon={Salad}
      />

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

const FoodSelection = ({ categories, title, max, Icon }) => {
  return (
    <div className="border-primary/20 border p-3 rounded-sm">
      <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
        <Icon color="gray" />
        {title}
        <span className="rounded-full bg-primary/90 px-2 py-0.5 text-xs font-medium text-white">
          Choose up to {max}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-2">
        {categories.map((main, idx) => (
          <div
            key={idx}
            className={cn(
              "px-4 border-l lg:border-l-0",
              (idx + 1) % 3 !== 1 && "lg:border-l",
            )}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{main?.category?.name}</h3>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {main?.limit === 1 ? "Choose 1" : `Choose up to ${main?.limit}`}
              </span>
            </div>

            <ul className="mt-1 list-disc list-outside ml-4">
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
      <div className="flex flex-col gap-2 ">
        <h2 className="font-bold">{title}</h2>
        <div className="flex flex-col gap-2">
          {inclusions.map(({ item, unit = null, amount }, idx) => (
            <div className="flex items-start gap-2" key={idx}>
              <Check className="mt-1 size-4 shrink-0 text-accent" />

              <span>
                {item?.name}
                {unit &&
                  ` (${amount}${unit === "hrs" ? (amount > 1 ? " hrs" : " hr") : ""})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
