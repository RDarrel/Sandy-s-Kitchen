import { cn } from "@/lib/utils";
import { Beef, Salad } from "lucide-react";
import Inclusions from "./inclusions";

const Body = ({ selected }) => {
  const { mainCourseCategories = [], sideMenuCategories = [] } = selected;

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
      <Inclusions catering={selected} />
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
