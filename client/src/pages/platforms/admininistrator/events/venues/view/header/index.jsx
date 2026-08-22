import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import { Paperclip, Clock, UserPlus, Users, Home, MapPin } from "lucide-react";

const Header = ({ selected }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr]  ">
      <div className="h-[11rem] lg:h-auto">
        <Gallery venue={selected} />
      </div>

      <div className="p-3 border border-t-0 md:border-t md:border-l-0  rounded-sm rounded-t-none md:rounded-t md:rounded-l-none border-primary/20 ">
        <div className="flex flex-col rounded-sm  gap-3 ml-1 ">
          <h2 className="font-bold text-2xl md:text-3xl m-0 ">
            {capitalize(selected?.name)}
          </h2>
          <p className="-mt-2 flex items-start items-center gap-2 font-bold text-[0.76rem] text-muted-foreground">
            <MapPin className=" h-4 w-4 shrink-0" />
            <span className="min-w-0">{selected?.address}</span>
          </p>
          <h2 className="-mt-2">{selected?.description}</h2>
          <div className="grid grid-rows-2 hidden  md:grid md:grid-rows-2 gap-2">
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

          <div className="grid grid-rows-3 gap-2 md:hidden ">
            <div className="grid grid-cols-2  gap-2">
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
              ].map((metric, idx) => (
                <Metric metric={metric} key={`main-metric-${idx}`} />
              ))}
            </div>
            <div className="grid grid-cols-2   gap-2">
              {[
                {
                  title: "Duration",
                  value: `${selected?.duration?.min}–${selected?.duration?.max} hrs`,
                  subTitle: "Allowed Hours",
                  Icon: Clock,
                },
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
              ].map((metric, idx) => (
                <Metric metric={metric} key={`main-metric-${idx}`} />
              ))}
            </div>
            <div className="grid grid-cols-1  gap-2">
              {[
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
      <span className="font-bold text-[1rem] md:text-[1.2rem]">{value}</span>
      <h1 className="text-[0.7rem] mt-auto">{subTitle}</h1>
    </div>
  );
};

const Gallery = ({ venue }) => {
  const thumbnail = venue.images[0] || "";

  const getImage = (image) => {
    return Cloudinary.getVenueImg(
      image?.version,
      venue?._id,
      `image-${image?.id}`,
    );
  };
  return (
    <div className="venue-card__gallery rounded-t-sm lg:rounded-l-sm lg:rounded-t-none">
      <div className="relative min-h-0 overflow-hidden">
        <img
          src={getImage(thumbnail, 1)}
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className={`venue-card__thumbs grid grid-cols-${venue?.images?.length - 1} gap-1`}
      >
        {venue.images.slice(1, 4).map((image, index) => (
          <img
            src={getImage(image, index + 2)}
            alt={`${venue.name} preview ${index + 2}`}
            key={`venue-gallery-${index}`}
          />
        ))}
      </div>
    </div>
  );
};
