import { memo } from "react";
import { Formatter } from "@/services/utilities";
import { Check, ListChecks, UsersRound, Beef, Salad } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cloudinary from "@/services/utilities/cloudinary";
import Actions from "./actions";

const MAX_VISIBLE_MENUS = 6;
const MAX_VISIBLE_MENUS_WITH_MORE = 5;
const isCashierVisible = true;

const Package = ({ item, handleAction = () => {} }) => {
  const { mainCourseCategories } = item;
  const mainMenus = mainCourseCategories.flatMap(({ choices }) =>
    choices.map((choice) => choice),
  );
  const mainCoursesLength = mainCourseCategories.reduce(
    (acc, curr) => acc + curr?.choices?.length,
    0,
  );
  const hasHiddenInclusions = mainCoursesLength > MAX_VISIBLE_MENUS;
  const visibleLimit = hasHiddenInclusions
    ? MAX_VISIBLE_MENUS_WITH_MORE
    : MAX_VISIBLE_MENUS;
  const visibleMenus = mainMenus.slice(0, visibleLimit);
  const hiddenInclusions = mainCoursesLength - visibleMenus.length;

  return (
    <article className="admin-package" key={item.name}>
      <div className="admin-package__media">
        <img
          alt={`${item.name} admin package`}
          src={Cloudinary.getPackageImg(item.imgId, item?._id)}
        />
        <div className="flex items-center space-x-2 bg-red-500">
          <button
            type="button"
            className={`inline-flex items-center mt-1 ml-1 gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold shadow-md backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
              isCashierVisible
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                : "border-white/30 bg-black/55 text-white"
            }`}
          >
            <span>{isCashierVisible ? "Available" : "Unavailable"}</span>
            <span
              className={`relative h-3.5 w-6 rounded-full transition ${
                isCashierVisible ? "bg-emerald-500/90" : "bg-white/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition ${
                  isCashierVisible ? "left-3" : "left-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div className="admin-package__body">
        <div className="admin-package__content">
          <div className="admin-package__heading">
            {item.tag && <span>{item.tag}</span>}
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </div>

          <div className="admin-package__price">
            <div className="flex gap-2 align-items-center  ">
              <div className="text-left">
                <strong>{`${Formatter.amount(item.basePrice)}`}</strong>
                <small>
                  + {Formatter.amount(item.addPricePerGuest)} / guest
                </small>
              </div>
              <Actions handleAction={handleAction} item={item} />
            </div>
          </div>
        </div>

        <div className="admin-package__summary">
          <span>
            <UsersRound />
            {item.minimumGuests} Minimum Guests
          </span>
          <span>
            <Beef />
            {mainCoursesLength} Main Courses
          </span>
          <span>
            <Salad />
            {item.sideMenuCategories.length} Side Menus
          </span>
          <span>
            <ListChecks />
            {item.inclusions.length} inclusions
          </span>
        </div>

        <ul className="admin-package__inclusions">
          {visibleMenus.map((menu, idx) => (
            <li key={idx}>
              <Check />
              {menu?.name}
            </li>
          ))}
          {hasHiddenInclusions && (
            <li className="admin-package__more">+{hiddenInclusions} more</li>
          )}
        </ul>
        <Button
          className="catering-package__button"
          variant="outline"
          onClick={() => handleAction("view", item)}
        >
          View Details
        </Button>
      </div>
    </article>
  );
};

export default memo(Package);
