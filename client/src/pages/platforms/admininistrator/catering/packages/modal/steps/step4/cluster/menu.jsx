import { memo } from "react";
import { Input } from "@/components/ui/input";
import { capitalize } from "lodash";
import Cloudinary from "@/services/utilities/cloudinary";

const Menu = ({
  menu,
  isMainCourse,
  prepQty = 0,
  targetPax,
  onUpdateQtyServe = () => {},
}) => {
  const recipeYield = Math.max(menu.recipeYield || 1, 1);
  const suggestedServeQty = targetPax / recipeYield;
  return (
    <div className="grid gap-3 px-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_13rem_0rem] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <img
          className="size-10 rounded-md border object-cover shadow-sm"
          alt={`${menu?.name || "Menu"} preview`}
          src={Cloudinary.getMenuImg(menu?.imgId, menu?._id)}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {capitalize(menu?.name || "")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Recipe yield:{" "}
            <span className="font-semibold text-foreground">
              {recipeYield} serve/person
            </span>
          </p>
        </div>
      </div>

      <label className="flex items-center justify-end gap-2">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Preparation Quantity
        </span>
        <Input
          className="h-8 w-20 text-center font-medium"
          min="1"
          onChange={({ target }) =>
            onUpdateQtyServe(
              isMainCourse,
              menu?.category?._id,
              menu._id,
              Number(target.value),
            )
          }
          placeholder={"0"}
          type="number"
          value={String(prepQty || suggestedServeQty)}
        />
      </label>
    </div>
  );
};

export default memo(Menu);
