import React from "react";

import { CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import Search from "@/components/shared/search";

const Header = () => {
  return (
    <CardHeader>
      <CardTitle>Sales</CardTitle>

      {/* <CardAction>
        <Search
          haveAction={false}
          title={"sales by transaction id"}
          width="w-70"
        />
      </CardAction> */}
    </CardHeader>
  );
};

export default Header;
