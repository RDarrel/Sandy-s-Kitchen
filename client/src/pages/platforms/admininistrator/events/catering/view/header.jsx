import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import {
  Beef,
  Clock,
  Gift,
  Paperclip,
  PartyPopper,
  Salad,
  Timer,
  UserPlus,
  Users,
} from "lucide-react";

const Header = ({ selected }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] ">
      <div>
        <img
          src={Cloudinary.getPackageImg(selected?.imgId || "", selected?._id)}
          className="w-full h-full max-h-[10rem] lg:max-h-[18.2rem] object-cover rounded-sm rounded-b-none md:rounded-r-none md:rounded-l-sm "
          alt={`Image not found for ${selected?.name}`}
        />
      </div>

      <div className="p-3 border border-t-0 md:border-t md:border-l-0  rounded-sm rounded-t-none md:rounded-t md:rounded-l-none border-primary/20 ">
        <div className="flex flex-col rounded-sm  gap-3 ml-1 ">
          <h2 className="font-bold text-2xl md:text-3xl m-0 ">
            {capitalize(selected?.name)}
          </h2>

          <h2 className="-mt-2">{selected?.description}</h2>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 md:grid-cols-3  gap-2">
              {[
                {
                  title: "Guests Included",
                  value: selected?.includedGuests,
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
                  title: "Additional Guest  Fee",
                  value: Formatter.amount(selected?.addPricePerGuest),

                  subTitle: "Per Additional  Guest",
                  Icon: UserPlus,
                },
                {
                  title: "Included Hours",
                  value: selected?.includedHours,
                  subTitle: "Catering Service",
                  Icon: Clock,
                },
                {
                  title: "Additional Hour Fee",
                  value: Formatter.amount(selected?.addPricePerHour),
                  subTitle: "Per Additional Hour",
                  Icon: Timer,
                },
                {
                  title: "Inclusions",
                  value: selected?.inclusions?.length,
                  subTitle: "Equipment & Service",
                  Icon: Gift,
                },
              ].map((metric, idx) => (
                <Metric metric={metric} key={`main-metric-${idx}`} />
              ))}
            </div>
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
    <div className="bg-primary/5 p-2   text-center rounded-sm flex flex-col ">
      <div className="flex">
        <Icon size={15} />
        <span className="text-[0.7rem] ml-2 text-start">{title}</span>
      </div>
      <span className="font-bold text-xl">{value}</span>
      <h1 className="text-[0.7rem] mt-auto">{subTitle}</h1>
    </div>
  );
};
