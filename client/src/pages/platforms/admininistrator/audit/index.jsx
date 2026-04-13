import React from "react";
import { Card } from "@/components/ui/card";

import Header from "./header";
import Body from "./body";

const Audit = () => {
  return (
    <div className="flex-1">
      <Card>
        <Header />
        <Body />
      </Card>
    </div>
  );
};

export default Audit;
