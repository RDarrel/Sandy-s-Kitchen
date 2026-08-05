import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import { Beef, Gift, Paperclip, Salad, UserPlus, Users } from "lucide-react";

const Header = ({ selected }) => {
  return (
    <div className="grid grid-cols-[22rem_1fr] gap-5 ">
      <div className="h-[17.6rem]">
        <img
          src={Cloudinary.getPackageImg(selected?.imgId || "", selected?._id)}
          className="w-full h-full object-cover rounded-sm "
          alt={`Image not found for ${selected?.name}`}
        />
      </div>
      <div className="flex flex-col  gap-3 ">
        <h2 className="font-bold text-[2rem] m-0 ">
          {capitalize(selected?.name)}
        </h2>
        <h2 className="-mt-2">{selected?.description}</h2>
        <div className="grid grid-rows-2 gap-2">
          <div className="grid grid-cols-3  gap-2">
            {[
              {
                title: "Minimum Guests",
                value: 50,
                subTitle: "Required",
                Icon: Users,
              },
              {
                title: "Package Price",
                value: Formatter.amount(selected?.basePrice),
                subTitle: "Base Rate",
                Icon: Paperclip,
              },
              {
                title: "Additional Fee",
                value: Formatter.amount(selected?.addPricePerGuest),

                subTitle: "Per Guest",
                Icon: UserPlus,
              },
            ].map((metric, idx) => (
              <Metric metric={metric} key={`main-metric-${idx}`} />
            ))}
          </div>
          <div className="grid grid-cols-3  gap-2">
            {[
              {
                title: "Main Courses",
                value: 50,
                subTitle: "Included",
                Icon: Beef,
              },
              {
                title: "Side Menus",
                value: 50,
                subTitle: "Included",
                Icon: Salad,
              },
              {
                title: "Inclusions",
                value: 50,
                subTitle: "Equipment & Service",
                Icon: Gift,
              },
            ].map((metric, idx) => (
              <Metric metric={metric} key={`additional-${idx}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

const Metric = ({ metric }) => {
  const { title, subTitle, value, Icon } = metric;
  return (
    <div className="bg-primary/5 p-2   text-center rounded-sm ">
      <div className="flex">
        <Icon size={15} />
        <span className="text-[0.7rem] ml-2">{title}</span>
      </div>
      <span className="font-bold text-[1.2rem]">{value}</span>
      <h1 className="text-[0.7rem]">{subTitle}</h1>
    </div>
  );
};
