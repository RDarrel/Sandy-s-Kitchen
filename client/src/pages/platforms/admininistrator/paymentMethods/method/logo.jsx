import { createElement } from "react";
import Cloudinary from "@/services/utilities/cloudinary";

const Logo = ({ method, fallbackIcon }) => {
  return (
    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background p-2">
      {method?.methodImgId ? (
        <img
          src={Cloudinary.getPaymentMethodImg(
            method?.methodImgId || "",
            method?._id,
            "method",
          )}
          alt={`${method.name} logo`}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        createElement(fallbackIcon, {
          className: "size-5 text-muted-foreground",
        })
      )}
    </div>
  );
};

export default Logo;
