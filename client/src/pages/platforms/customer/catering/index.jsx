import Catering from "@/pages/website/catering";
import { useState } from "react";
import Details from "./details";

const CateringParent = () => {
  const [selected, setSelected] = useState({});
  console.log("selected", selected);
  return (
    <div>
      {selected?._id ? (
        <Details selected={selected} />
      ) : (
        <Catering isWebsite={false} onSelect={setSelected} />
      )}
    </div>
  );
};

export default CateringParent;
