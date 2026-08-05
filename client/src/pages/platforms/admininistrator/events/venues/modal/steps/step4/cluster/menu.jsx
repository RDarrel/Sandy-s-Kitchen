import { memo } from "react";
import { capitalize } from "lodash";
import Cloudinary from "@/services/utilities/cloudinary";

const Menu = ({ menu }) => {
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
            {menu?.description || ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(Menu);
