import { Formatter } from "@/services/utilities";
import { capitalize } from "lodash";
import { Clock, Home, MapPin, Paperclip, UserPlus, Users } from "lucide-react";
import Gallery from "./gallery";

const Header = ({ selected }) => {
  return (
    <div className="grid grid-cols-[22rem_1fr] gap-5 ">
      <div className="h-[18.2rem]">
        <Gallery venue={selected} />
      </div>
      <div className="flex flex-col  gap-3 ">
        <h2 className="font-bold text-[2rem] m-0 ">
          {capitalize(selected?.name)}
        </h2>
        <p className="-mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0">{selected?.address}</span>
        </p>
        <h2 className="-mt-2">{selected?.description}</h2>
        <div className="grid grid-rows-2 gap-2">
          <div className="grid grid-cols-3  gap-2">
            {[
              {
                title: "Max Capacity",
                value: selected?.capacity,
                subTitle: "Guests",
                Icon: Users,
              },
              {
                title: "Venue Price",
                value: Formatter.amount(selected?.basePrice),
                subTitle: "Base Rate",
                Icon: Paperclip,
              },
              {
                title: "Duration",
                value: `${selected?.duration?.min}–${selected?.duration?.max} hrs`,
                subTitle: "Allowed Hours",
                Icon: Clock,
              },
            ].map((metric, idx) => (
              <Metric metric={metric} key={`main-metric-${idx}`} />
            ))}
          </div>
          <div className="grid grid-cols-2  gap-2">
            {[
              {
                title: "Additional Charges",
                value: (
                  <>
                    {Formatter.amount(selected?.additionalCharges?.perHour)}
                    {" / hr"}
                  </>
                ),
                subTitle: `+ ${Formatter.amount(
                  selected?.additionalCharges?.perPax,
                )} / guest`,
                Icon: UserPlus,
              },
              {
                title: "Venue Setting",
                value: selected?.setting,
                subTitle: "Environment",
                Icon: Home,
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
