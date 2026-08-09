import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { UsersRound, Check, ListChecks, Beef, Salad } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { useNavigate } from "react-router-dom";
import Cloudinary from "@/services/utilities/cloudinary";
const Package = ({ item = {} }) => {
  const navigate = useNavigate();
  const { hiddenInclusions, visibleMenus, hasHiddenInclusions } =
    useMemo(() => {
      return Formatter.packageIncluded(item);
    }, [item]);

  const sideMenusTotalLimit = useMemo(() => {
    return item?.sideMenuCategories.reduce(
      (acc, curr) => (acc += curr.limit),
      0,
    );
  }, [item]);

  const handleInquire = () => {
    sessionStorage.setItem(
      "inquiry",
      JSON.stringify({
        type: "package",
        id: item._id,
      }),
    );
    navigate("/authentication/login");
  };

  return (
    <article className="catering-package">
      <div className="catering-package__media">
        <img
          alt={`${item.name} catering package`}
          src={Cloudinary.getPackageImg(item?.imgId, item?._id)}
        />
      </div>

      <div className="catering-package__body">
        <div className="catering-package__content">
          <div className="catering-package__heading">
            {item.tag && <span>{item.tag}</span>}
            <h2>{item.name}</h2>
            <p>{item.description}</p>
          </div>

          <div className="catering-package__price">
            <strong>{Formatter.amount(item.basePrice)}</strong>
            <small>Starting Rate</small>
          </div>
        </div>

        <div className="catering-package__summary">
          <span>
            <UsersRound />
            {item.minimumGuests} Minimum Guests
          </span>
          <span>
            <Beef />
            {item.mainCourseLimit} Main Courses
          </span>
          <span>
            <Salad />
            {sideMenusTotalLimit} Side Menus
          </span>
          <span>
            <ListChecks />
            {item.inclusions.length} inclusions
          </span>
        </div>

        <ul className="catering-package__inclusions">
          {visibleMenus.map((menu, idx) => (
            <li key={idx}>
              <Check />
              {menu?.name}
            </li>
          ))}
          {hasHiddenInclusions && (
            <li className="catering-package__more">+{hiddenInclusions} more</li>
          )}
        </ul>

        <Button
          className="catering-package__button"
          variant="outline"
          onClick={handleInquire}
        >
          Inquire Package
        </Button>
      </div>
    </article>
  );
};

export default memo(Package);
