import Cloudinary from "@/services/utilities/cloudinary";
import { capitalize } from "lodash";
import { Users } from "lucide-react";

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
              { title: "Minimum", value: 50, subTitle: "Guests" },
              { title: "Main Courses", value: 50, subTitle: "Menus" },
              {
                title: "Additional",
                value: 50,
                subTitle: "Per Guest",
              },
            ].map(({ title, value, subTitle }, idx) => (
              <div
                key={idx}
                className="bg-primary/5 p-2 text-center rounded-sm "
              >
                <div className="flex">
                  <Users size={20} />
                  <span className="text-xs ml-2">{title}</span>
                </div>
                <span className="font-bold text-[1.2rem]">{value}</span>
                <h1 className="text-xs">{subTitle}</h1>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3  gap-2">
            {[
              { title: "Minimum", value: 50, subTitle: "Guests" },
              { title: "Minimum", value: 50, subTitle: "Guests" },
              { title: "Minimum", value: 50, subTitle: "Guests" },
            ].map(({ title, value, subTitle }, idx) => (
              <div
                key={idx}
                className="bg-primary/5 p-2   text-center rounded-sm "
              >
                <div className="flex">
                  <Users size={20} />
                  <span className="text-xs ml-2">{title}</span>
                </div>
                <span className="font-bold text-[1.2rem]">{value}</span>
                <h1 className="text-xs">{subTitle}</h1>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
