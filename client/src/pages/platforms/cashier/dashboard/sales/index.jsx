import React from "react";
import { Card } from "@/components/ui/card";

import Header from "./header";
import Body from "./body";
import FuelBreakdown from "./Breakdown";

const Sales = () => {
  return (
    <div className="flex gap-4 w-[77rem]  mb-8">
      <div className="flex-1">
        <Card>
          <Header />
          <Body />
        </Card>
      </div>
      <div className="w-70">
        <FuelBreakdown />
      </div>
    </div>
  );
};

export default Sales;
