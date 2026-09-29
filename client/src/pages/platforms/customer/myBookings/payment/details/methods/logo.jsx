import Cloudinary from "@/services/utilities/cloudinary";
import { TYPE_META } from "../../constant";

const MethodLogo = ({ method, className = "size-7" }) => {
  const Icon = TYPE_META[method?.type]?.icon || CreditCard;

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-background p-1 ${className}`}
    >
      {method?.methodImgId ? (
        <img
          src={Cloudinary.getPaymentMethodImg(
            method.methodImgId,
            method._id,
            "method",
          )}
          alt={`${method.name} logo`}
          draggable={false}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <Icon className="size-3.5 text-muted-foreground" />
      )}
    </span>
  );
};

export default MethodLogo;
