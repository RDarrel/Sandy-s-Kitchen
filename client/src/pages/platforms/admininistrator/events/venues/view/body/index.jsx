import { Badge } from "@/components/ui/badge";
import { PartyPopper } from "lucide-react";
import Inclusions from "./inclusions";

const Body = ({ selected }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="border border-primary/20 p-3 rounded-sm ">
        <h2 className="font-bold text-xl mb-2 flex gap-2 items-center">
          <PartyPopper color="gray" className="" /> Best For
        </h2>
        <div className="flex flex-wrap gap-2">
          {selected?.types?.map((item) => (
            <Badge key={item} className="mr-2 text-sm" variant={"outline"}>
              {item}
            </Badge>
          ))}
        </div>
      </div>
      <Inclusions venue={selected} />
    </div>
  );
};

export default Body;
